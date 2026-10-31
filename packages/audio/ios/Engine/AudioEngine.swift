import AVFoundation
import Foundation
import MediaPlayer

/// What the engine needs from the outside world. `.live` talks to the system;
/// tests swap in fakes.
public struct EngineEnvironment {
  var publishNowPlaying: @MainActor ([String: Any]?) -> Void
  var loadsArtwork: Bool
  var installsRemoteCommands: Bool
  var managesAudioSession: Bool
  /// Monotonic clock in milliseconds.
  var nowMs: @MainActor () -> Double
  var fileExists: @MainActor (URL) -> Bool
  /// Called on every player the engine creates.
  var configurePlayer: @MainActor (AVQueuePlayer) -> Void = { _ in }

  @MainActor
  public static var live: EngineEnvironment {
    EngineEnvironment(
      publishNowPlaying: { MPNowPlayingInfoCenter.default().nowPlayingInfo = $0 },
      loadsArtwork: true,
      installsRemoteCommands: true,
      managesAudioSession: true,
      nowMs: { ProcessInfo.processInfo.systemUptime * 1000 },
      fileExists: { FileManager.default.fileExists(atPath: $0.path) }
    )
  }
}

/// SYNQ's playback engine. Owns the queue and an `AVQueuePlayer` holding the
/// current item plus the next one, preloaded, so tracks change gaplessly and
/// without JavaScript. Every method and callback runs on the main actor.
@MainActor
public final class AudioEngine {
  /// Previous restarts the track after this much playback, else goes back.
  static let previousRestartThresholdMs: Double = 3000
  static let progressIntervalMs: Int64 = 500

  /// Receives every event, on the main thread.
  public var onEvent: (@MainActor (EngineEvent) -> Void)?

  private(set) var player: AVQueuePlayer
  private let env: EngineEnvironment
  private let nowPlaying: NowPlayingController
  private let remoteCommands = RemoteCommandController()
  private let session = AudioSessionController()

  private(set) var queue = PlaybackQueue()
  private(set) var repeatMode: RepeatMode = .off

  /// The queue entry playback is on. While the interstitial plays, the entry
  /// that plays after it. Kept after the queue ends or fails.
  private var currentKey: EntryKey?
  /// The item in the player for `currentKey` (or the interstitial).
  private(set) var current: Slot?
  /// The preloaded item after `current`.
  private(set) var upcoming: Slot?

  private var playWhenReady = false
  private var ended = false
  private var failed = false
  private var failedKeys = Set<EntryKey>()
  private var resumeAfterInterruption = false
  /// The player stopped while we meant to play, and nobody has asked for
  /// anything since. iOS can pause the player before it posts the
  /// interruption notification; this keeps "was playing" true for it.
  private var pausedBySystem = false

  /// Where a newly loaded item starts. Playback is held until the seek lands.
  private var startPositionMs: Double?
  /// Target of the seek in flight, reported as the position until it lands.
  private(set) var seekingToMs: Double?
  private var seekGeneration: UInt64 = 0

  private var interstitialConfig: InterstitialConfig?
  private var counter = ListeningCounter()
  /// Where the queue entry resumes after the interstitial.
  private var resumePositionMs: Double = 0
  private var dueCheck: DispatchWorkItem?
  private(set) var skipAndSeekEnabled = true

  private var playerObservations: [NSKeyValueObservation] = []
  private var progressObserver: Any?
  private var lastState: StateKey?

  public init(environment: EngineEnvironment) {
    env = environment
    player = AVQueuePlayer()
    nowPlaying = NowPlayingController(publish: environment.publishNowPlaying, loadsArtwork: environment.loadsArtwork)
    configurePlayer()
    if env.installsRemoteCommands {
      remoteCommands.install { [weak self] command in
        self?.handleRemote(command) ?? false
      }
    }
    if env.managesAudioSession {
      session.start { [weak self] event in
        self?.handleSession(event)
      }
    }
  }

  /// Stops playback and releases system resources.
  public func tearDown() {
    cancelDueCheck()
    setProgressObserved(false)
    playerObservations.forEach { $0.invalidate() }
    playerObservations.removeAll()
    remoteCommands.uninstall()
    session.stop()
    discardUpcoming()
    current?.invalidate()
    current = nil
    player.pause()
    player.removeAllItems()
    nowPlaying.clear()
  }

  // MARK: - Queue

  public var tracks: [Track] { queue.tracks }

  public var currentIndex: Int? { currentKey.flatMap(queue.index(of:)) }

  /// Replaces the queue. When the track at `startIndex` has the same id as the
  /// one playing, its item keeps playing untouched (no seek unless
  /// `positionMs` is given; play state kept unless `play` is given).
  /// Otherwise playback moves to `startIndex` at `positionMs` (default 0) and
  /// plays unless `play` is false.
  public func setQueue(_ tracks: [Track], startIndex: Int = 0, positionMs: Double? = nil, play: Bool? = nil) {
    guard !tracks.isEmpty else {
      clear()
      return
    }
    let start = min(max(startIndex, 0), tracks.count - 1)
    let inInterstitial = isInterstitialActive
    let liveKey = (ended || failed) && !inInterstitial ? nil : currentKey
    let keep = liveKey != nil && liveKey.flatMap { queue.entry(for: $0) }?.track.id == tracks[start].id

    queue.replace(with: tracks, reusing: keep ? liveKey : nil, at: start)
    failedKeys.removeAll()
    guard let key = queue.entry(at: start)?.key else { return }

    if inInterstitial {
      // The interstitial keeps playing; afterward, the new queue starts.
      currentKey = key
      if !keep { resumePositionMs = positionMs ?? 0 }
      if let play { setPlayWhenReady(play) }
      refreshUpcoming()
    } else if keep {
      if let current, current.content == .entry(key), current.track != tracks[start] {
        current.track = tracks[start]
        publishNowPlayingItem()
      }
      if let positionMs { _ = seekCurrent(to: positionMs) }
      if let play { setPlayWhenReady(play) }
      refreshUpcoming()
      nowPlaying.updateQueue(index: currentIndex, count: queue.count)
    } else {
      let shouldPlay = play ?? true
      playWhenReady = shouldPlay
      // Restoring a paused session isn't a transition the listener hears.
      transition(to: key, positionMs: positionMs ?? 0, direction: .natural, allowsInterstitial: shouldPlay)
    }
    emitQueue()
    emitState()
  }

  /// Inserts tracks before `index` (default: the end). The current item keeps
  /// playing. Inserting into an empty queue loads the first track, paused.
  public func insert(_ tracks: [Track], at index: Int? = nil) {
    guard !tracks.isEmpty else { return }
    let wasEmpty = queue.isEmpty
    let firstInserted = queue.insert(tracks, at: index ?? queue.count)
    if isInterstitialActive {
      // Nothing was going to follow the interstitial; now the insert does.
      if currentKey == nil { currentKey = queue.entry(at: firstInserted)?.key }
      refreshUpcoming()
    } else if wasEmpty || currentKey == nil, let first = queue.entry(at: 0) {
      playWhenReady = false
      currentKey = first.key
      activate(.entry(first.key), positionMs: 0, mode: .jump, direction: .natural)
    } else {
      refreshUpcoming()
      nowPlaying.updateQueue(index: currentIndex, count: queue.count)
    }
    emitQueue()
    emitState()
  }

  /// Removes entries. Removing the current entry moves playback to the entry
  /// that took its place (keeping the play state); the rest never interrupt.
  public func remove(_ indices: [Int]) {
    let removing = Set(indices.filter { $0 >= 0 && $0 < queue.count })
    guard !removing.isEmpty else { return }
    let position = currentKey.flatMap(queue.index(of:))
    let removesCurrent = position.map(removing.contains) ?? false
    let removedKeys = queue.remove(removing)
    failedKeys.subtract(removedKeys)

    guard !queue.isEmpty else {
      clear()
      return
    }
    if removesCurrent, let position {
      let shifted = position - removing.filter { $0 < position }.count
      let replacement = queue.entry(at: shifted) ?? (repeatMode == .off ? nil : queue.entry(at: 0))
      if isInterstitialActive {
        // Nil when nothing follows: the queue ends after the interstitial.
        currentKey = replacement?.key
        resumePositionMs = 0
        refreshUpcoming()
      } else if let replacement {
        currentKey = replacement.key
        activate(.entry(replacement.key), positionMs: 0, mode: .jump, direction: .natural)
      } else if let last = queue.entry(at: queue.count - 1) {
        // The last entry was playing and nothing follows: stop on the new last.
        playWhenReady = false
        currentKey = last.key
        activate(.entry(last.key), positionMs: 0, mode: .jump, direction: .natural)
      }
    } else {
      refreshUpcoming()
      nowPlaying.updateQueue(index: currentIndex, count: queue.count)
    }
    emitQueue()
    emitState()
  }

  /// Moves an entry; the current item keeps playing.
  public func move(from: Int, to: Int) {
    guard queue.move(from: from, to: to) else { return }
    refreshUpcoming()
    nowPlaying.updateQueue(index: currentIndex, count: queue.count)
    emitQueue()
    emitState()
  }

  // MARK: - Transport

  public func play() {
    guard !queue.isEmpty else { return }
    if current == nil || ended || failed {
      let key = currentKey.flatMap { queue.contains($0) ? $0 : nil } ?? queue.entry(at: 0)?.key
      guard let key else { return }
      if failed { failedKeys.removeAll() }
      playWhenReady = true
      transition(to: key, positionMs: 0, direction: .natural, allowsInterstitial: true)
      emitState()
      return
    }
    setPlayWhenReady(true)
  }

  public func pause() {
    resumeAfterInterruption = false
    setPlayWhenReady(false)
  }

  /// Pauses when playing (or about to), else plays. Follows the visible
  /// status, so a toggle right after the system paused playback resumes it.
  public func toggle() {
    switch status {
    case .playing, .loading:
      pause()
    case .idle, .paused, .ended, .error:
      play()
    }
  }

  /// Seeks the current item. Returns false while the interstitial plays or
  /// when nothing is loaded.
  @discardableResult
  public func seek(toMs positionMs: Double) -> Bool {
    guard !isInterstitialActive else { return false }
    return seekCurrent(to: positionMs)
  }

  /// Goes to the next entry (wrapping when repeat is on). Returns false at the
  /// end of the queue with repeat off, or while the interstitial plays.
  @discardableResult
  public func next() -> Bool {
    guard !isInterstitialActive, let key = currentKey else { return false }
    let isPlayable = playableCheck
    guard let target = queue.neighbor(of: key, direction: .next, repeatMode: repeatMode, isPlayable: isPlayable) else {
      return false
    }
    playWhenReady = true
    transition(to: target, positionMs: 0, direction: .next, allowsInterstitial: true)
    emitState()
    return true
  }

  /// Restarts the track after 3 seconds of it (or on the first entry), else
  /// goes to the previous entry. Returns false while the interstitial plays.
  @discardableResult
  public func previous() -> Bool {
    guard !isInterstitialActive, let key = currentKey else { return false }
    let isPlayable = playableCheck
    let target = queue.neighbor(of: key, direction: .previous, repeatMode: repeatMode, isPlayable: isPlayable)
    if positionMs >= Self.previousRestartThresholdMs || target == nil {
      return seekCurrent(to: 0)
    }
    guard let target else { return false }
    playWhenReady = true
    transition(to: target, positionMs: 0, direction: .previous, allowsInterstitial: true)
    emitState()
    return true
  }

  /// Plays the entry at `index`. Returns false for an invalid index or while
  /// the interstitial plays.
  @discardableResult
  public func skip(to index: Int) -> Bool {
    guard !isInterstitialActive, let entry = queue.entry(at: index) else { return false }
    // An explicit choice retries an entry that failed before.
    failedKeys.remove(entry.key)
    playWhenReady = true
    transition(to: entry.key, positionMs: 0, direction: .natural, allowsInterstitial: true)
    emitState()
    return true
  }

  public func setRepeatMode(_ mode: RepeatMode) {
    guard mode != repeatMode else { return }
    repeatMode = mode
    refreshUpcoming()
    emitState()
  }

  // MARK: - Interstitial

  /// Configures the interstitial (nil for none). Native counts listening time
  /// from `listenedMs` (or keeps its count when that is nil); once past
  /// `afterListeningMs`, the next transition plays the interstitial first.
  /// Clearing it while it plays stops it and playback continues.
  public func configureInterstitial(_ config: InterstitialConfig?) {
    let now = env.nowMs()
    if let config {
      interstitialConfig = config
      if let listenedMs = config.listenedMs {
        counter.reset(to: listenedMs, nowMs: now)
      }
    } else {
      interstitialConfig = nil
      counter = ListeningCounter()
      if isInterstitialActive {
        let position = resumePositionMs
        endInterstitial()
        resumeAfterInterstitial(positionMs: position, mode: .jump)
      }
    }
    updateListening()
    refreshUpcoming()
    emitState(force: true)
  }

  public var listenedMs: Double {
    interstitialConfig == nil ? 0 : counter.value(nowMs: env.nowMs())
  }

  var isInterstitialActive: Bool { current?.content == .interstitial }

  var isInterstitialDue: Bool {
    guard let interstitialConfig else { return false }
    return counter.value(nowMs: env.nowMs()) >= interstitialConfig.afterListeningMs
  }

  // MARK: - State

  public func snapshot() -> PlaybackSnapshot {
    PlaybackSnapshot(
      status: status,
      index: currentIndex,
      trackId: current?.track.id ?? currentKey.flatMap { queue.entry(for: $0) }?.track.id,
      positionMs: positionMs,
      durationMs: current?.durationMs ?? 0,
      repeatMode: repeatMode,
      queueLength: queue.count,
      interstitial: isInterstitialActive,
      listenedMs: listenedMs
    )
  }

  var status: PlaybackStatus {
    if failed { return .error }
    if ended { return .ended }
    guard let current else { return .idle }
    switch current.item.status {
    case .failed:
      return .loading
    case .unknown:
      return playWhenReady ? .loading : .paused
    default:
      break
    }
    if startPositionMs != nil { return playWhenReady ? .loading : .paused }
    switch player.timeControlStatus {
    case .playing:
      return player.currentItem === current.item ? .playing : .loading
    case .waitingToPlayAtSpecifiedRate:
      return playWhenReady ? .loading : .paused
    case .paused:
      return .paused
    @unknown default:
      return .paused
    }
  }

  var positionMs: Double {
    guard let current else { return 0 }
    if ended { return current.durationMs }
    if let startPositionMs { return startPositionMs }
    if let seekingToMs { return seekingToMs }
    guard player.currentItem === current.item else { return 0 }
    let time = player.currentTime()
    return time.isNumeric ? max(0, time.seconds * 1000) : 0
  }

  /// Progress events are produced only while observed (JS has a listener).
  public func setProgressObserved(_ observed: Bool) {
    if observed, progressObserver == nil {
      let interval = CMTime(value: Self.progressIntervalMs, timescale: 1000)
      progressObserver = player.addPeriodicTimeObserver(forInterval: interval, queue: .main) { @Sendable [weak self] _ in
        MainActor.assumeIsolated { self?.emitProgress() }
      }
      emitProgress()
    } else if !observed, let progressObserver {
      player.removeTimeObserver(progressObserver)
      self.progressObserver = nil
    }
  }

  // MARK: - Transitions

  private enum ActivationMode {
    /// The previous item ended; the queue player advances by itself.
    case natural
    /// Playback moves on request (skip, failure, edit).
    case jump
  }

  private var playableCheck: (QueueEntry) -> Bool {
    let failedKeys = failedKeys
    return { !failedKeys.contains($0.key) }
  }

  /// Moves playback to `key`, playing the interstitial first when it is due.
  private func transition(to key: EntryKey, positionMs: Double, direction: PlaybackQueue.Direction, allowsInterstitial: Bool) {
    if allowsInterstitial, isInterstitialDue, !isInterstitialActive {
      startInterstitial(before: key, positionMs: positionMs, mode: .jump)
    } else {
      currentKey = key
      activate(.entry(key), positionMs: positionMs, mode: .jump, direction: direction)
    }
  }

  /// Makes `content` the current item: the preloaded one when it matches,
  /// else a freshly loaded one.
  private func activate(_ content: Slot.Content, positionMs: Double, mode: ActivationMode, direction: PlaybackQueue.Direction) {
    let previous = current
    ended = false
    failed = false
    pausedBySystem = false
    startPositionMs = nil
    seekingToMs = nil
    seekGeneration &+= 1

    if positionMs <= 0, let upcoming, upcoming.content == content, upcoming.item.status != .failed,
       promote(upcoming, over: previous, mode: mode) {
      self.upcoming = nil
      current = upcoming
      previous?.invalidate()
      currentChanged()
      return
    }

    discardUpcoming()
    previous?.invalidate()
    current = nil
    player.removeAllItems()
    guard let slot = makeSlot(content) else {
      unplayable(content, direction: direction)
      return
    }
    current = slot
    player.insert(slot.item, after: nil)
    if positionMs > 0 { startPositionMs = positionMs }
    currentChanged()
  }

  /// Puts the preloaded item in front. Returns false when the player is in an
  /// unexpected state and the item should be loaded fresh instead.
  private func promote(_ upcoming: Slot, over previous: Slot?, mode: ActivationMode) -> Bool {
    if player.currentItem === upcoming.item { return true }
    guard let previous, player.currentItem === previous.item else { return false }
    switch mode {
    case .natural:
      // AVQueuePlayer moves on to the preloaded item by itself.
      return true
    case .jump:
      player.advanceToNextItem()
      return player.currentItem === upcoming.item
    }
  }

  private func currentChanged() {
    guard let current else { return }
    let inInterstitial = current.content == .interstitial
    if inInterstitial { emit(.interstitialStart) }
    setSkipAndSeekEnabled(!inInterstitial)
    applyPlayIntent()
    updateListening()
    refreshUpcoming()
    publishNowPlayingItem()
    emitState()
    emitProgress()
  }

  private func startInterstitial(before key: EntryKey, positionMs: Double, mode: ActivationMode) {
    currentKey = key
    resumePositionMs = positionMs
    activate(.interstitial, positionMs: 0, mode: mode, direction: .natural)
  }

  /// Resets the counter and re-enables skipping. The caller moves playback on.
  private func endInterstitial() {
    counter.reset(to: 0, nowMs: env.nowMs())
    cancelDueCheck()
    setSkipAndSeekEnabled(true)
    emit(.interstitialEnd)
  }

  private func resumeAfterInterstitial(positionMs: Double, mode: ActivationMode) {
    resumePositionMs = 0
    guard let key = currentKey, queue.contains(key) else {
      // Nothing follows: end on the last entry.
      currentKey = queue.entry(at: queue.count - 1)?.key
      current?.invalidate()
      current = nil
      player.removeAllItems()
      finishQueue()
      nowPlaying.clear()
      return
    }
    activate(.entry(key), positionMs: positionMs, mode: mode, direction: .natural)
  }

  /// The current item played to its end.
  private func itemDidEnd(_ slot: Slot) {
    guard slot === current, !ended, !failed else { return }
    switch slot.content {
    case .interstitial:
      let position = resumePositionMs
      endInterstitial()
      resumeAfterInterstitial(positionMs: position, mode: .natural)
    case .entry(let key):
      let isPlayable = playableCheck
      guard let follower = queue.neighbor(of: key, direction: .natural, repeatMode: repeatMode, isPlayable: isPlayable) else {
        finishQueue()
        return
      }
      if isInterstitialDue {
        startInterstitial(before: follower, positionMs: 0, mode: .natural)
      } else {
        currentKey = follower
        activate(.entry(follower), positionMs: 0, mode: .natural, direction: .natural)
      }
    }
  }

  private func itemFailed(_ slot: Slot, code: PlaybackError.Code, message: String?) {
    if slot === upcoming {
      // Found while preloading: report it now and preload what comes after.
      markUnplayable(slot.content, track: slot.track, code: code, message: message)
      discardUpcoming()
      refreshUpcoming()
      return
    }
    guard slot === current else { return }
    markUnplayable(slot.content, track: slot.track, code: code, message: message)
    unplayable(slot.content, direction: .natural)
  }

  /// `content` can't play (already reported): move past it.
  private func unplayable(_ content: Slot.Content, direction: PlaybackQueue.Direction) {
    switch content {
    case .interstitial:
      let position = resumePositionMs
      resumeAfterInterstitial(positionMs: position, mode: .jump)
    case .entry(let key):
      let isPlayable = playableCheck
      let follower = queue.neighbor(of: key, direction: direction, repeatMode: repeatMode, isPlayable: isPlayable)
        ?? queue.neighbor(of: key, direction: .natural, repeatMode: repeatMode, isPlayable: isPlayable)
      if let follower {
        currentKey = follower
        activate(.entry(follower), positionMs: 0, mode: .jump, direction: direction)
      } else {
        failQueue(at: key)
      }
    }
  }

  /// Records a failure and emits the error event.
  private func markUnplayable(_ content: Slot.Content, track: Track, code: PlaybackError.Code, message: String?) {
    switch content {
    case .entry(let key):
      failedKeys.insert(key)
      emit(.error(PlaybackError(
        code: code,
        message: message ?? "Couldn't play \(track.title).",
        trackId: track.id,
        index: queue.index(of: key)
      )))
    case .interstitial:
      // Count it as heard so a broken interstitial can't block playback.
      if isInterstitialActive {
        endInterstitial()
      } else {
        counter.reset(to: 0, nowMs: env.nowMs())
      }
      emit(.error(PlaybackError(
        code: .interstitialFailed,
        message: message ?? "Couldn't play the interstitial.",
        trackId: track.id,
        index: nil
      )))
    }
  }

  private func makeSlot(_ content: Slot.Content) -> Slot? {
    let track: Track
    switch content {
    case .entry(let key):
      guard let entry = queue.entry(for: key) else { return nil }
      track = entry.track
    case .interstitial:
      guard let interstitialConfig else { return nil }
      track = interstitialConfig.track
    }
    guard env.fileExists(track.url) else {
      markUnplayable(content, track: track, code: .fileMissing, message: "\(track.title) is missing its file.")
      return nil
    }
    let slot = Slot(content: content, track: track)
    slot.observe(
      status: { [weak self] slot in self?.itemStatusChanged(slot) },
      end: { [weak self] slot in self?.itemDidEnd(slot) },
      failure: { [weak self] slot, message in
        self?.itemFailed(slot, code: .playbackFailed, message: message)
      }
    )
    return slot
  }

  /// Keeps the item after the current one preloaded in the player, matching
  /// what plays when the current item ends.
  private func refreshUpcoming() {
    guard let current, !ended, !failed, player.items().contains(where: { $0 === current.item }) else {
      discardUpcoming()
      return
    }
    // Each failed attempt marks its entry unplayable, so this terminates.
    for _ in 0...queue.count + 1 {
      let desired = desiredUpcoming(after: current)
      if let upcoming, upcoming.content == desired, upcoming.item.status != .failed { return }
      discardUpcoming()
      guard let desired else { return }
      if let slot = makeSlot(desired) {
        guard player.canInsert(slot.item, after: current.item) else {
          slot.invalidate()
          return
        }
        player.insert(slot.item, after: current.item)
        upcoming = slot
        return
      }
    }
  }

  private func desiredUpcoming(after current: Slot) -> Slot.Content? {
    let isPlayable = playableCheck
    switch current.content {
    case .interstitial:
      guard let key = currentKey, resumePositionMs <= 0, queue.contains(key), !failedKeys.contains(key) else { return nil }
      return .entry(key)
    case .entry(let key):
      guard let follower = queue.neighbor(of: key, direction: .natural, repeatMode: repeatMode, isPlayable: isPlayable) else {
        return nil
      }
      return isInterstitialDue ? .interstitial : .entry(follower)
    }
  }

  private func discardUpcoming() {
    guard let upcoming else { return }
    if player.items().contains(where: { $0 === upcoming.item }) {
      player.remove(upcoming.item)
    }
    upcoming.invalidate()
    self.upcoming = nil
  }

  /// The queue played to its end (repeat off).
  private func finishQueue() {
    discardUpcoming()
    ended = true
    playWhenReady = false
    player.pause()
    updateListening()
    if let current {
      nowPlaying.updateTiming(elapsedMs: positionMs, durationMs: current.durationMs, playing: false)
    }
    emitState()
  }

  /// Nothing in the queue can play.
  private func failQueue(at key: EntryKey) {
    discardUpcoming()
    current?.invalidate()
    current = nil
    player.removeAllItems()
    currentKey = key
    failed = true
    playWhenReady = false
    updateListening()
    nowPlaying.clear()
    emitState()
  }

  private func clear() {
    let wasInInterstitial = isInterstitialActive
    discardUpcoming()
    current?.invalidate()
    current = nil
    currentKey = nil
    player.removeAllItems()
    queue.replace(with: [])
    failedKeys.removeAll()
    playWhenReady = false
    ended = false
    failed = false
    startPositionMs = nil
    seekingToMs = nil
    resumePositionMs = 0
    if wasInInterstitial {
      // Stopped, not heard: the interstitial stays due.
      setSkipAndSeekEnabled(true)
      emit(.interstitialEnd)
    }
    updateListening()
    nowPlaying.clear()
    emitQueue()
    emitState()
  }

  // MARK: - Playback intent

  private func setPlayWhenReady(_ value: Bool) {
    guard current != nil, !ended, !failed else {
      if value { play() }
      return
    }
    playWhenReady = value
    pausedBySystem = false
    applyPlayIntent()
    updateListening()
    if let current {
      nowPlaying.updateTiming(elapsedMs: positionMs, durationMs: current.durationMs, playing: status == .playing)
    }
    emitState()
  }

  private func applyPlayIntent() {
    guard current != nil, !ended, !failed, playWhenReady, startPositionMs == nil else {
      player.pause()
      return
    }
    if env.managesAudioSession {
      do {
        try session.activate()
      } catch {
        emit(.error(PlaybackError(code: .audioSession, message: error.localizedDescription, trackId: current?.track.id, index: currentIndex)))
      }
    }
    player.play()
  }

  private func seekCurrent(to requestedMs: Double) -> Bool {
    guard let current else { return false }
    let duration = current.durationMs
    let target = max(0, duration > 0 ? min(requestedMs, duration) : requestedMs)
    if ended {
      // Reload the finished item at the requested spot, paused.
      playWhenReady = false
      activate(current.content, positionMs: target, mode: .jump, direction: .natural)
      return true
    }
    if current.item.status != .readyToPlay {
      startPositionMs = target
      emitProgress()
      return true
    }
    if startPositionMs != nil { startPositionMs = target }
    issueSeek(to: target, in: current)
    nowPlaying.updateTiming(elapsedMs: target, durationMs: duration, playing: status == .playing)
    emitProgress()
    return true
  }

  private func issueSeek(to ms: Double, in slot: Slot) {
    seekGeneration &+= 1
    let generation = seekGeneration
    seekingToMs = ms
    let time = CMTime(value: CMTimeValue(ms.rounded()), timescale: 1000)
    player.seek(to: time, toleranceBefore: .zero, toleranceAfter: .zero) { @Sendable [weak self] _ in
      dispatchToMain { [weak self] in
        self?.seekLanded(generation: generation, slot: slot)
      }
    }
  }

  private func seekLanded(generation: UInt64, slot: Slot) {
    guard generation == seekGeneration, slot === current else { return }
    seekingToMs = nil
    let wasHolding = startPositionMs != nil
    startPositionMs = nil
    if wasHolding { applyPlayIntent() }
    nowPlaying.updateTiming(elapsedMs: positionMs, durationMs: slot.durationMs, playing: status == .playing)
    emitProgress()
    emitState()
  }

  // MARK: - Observers

  private func configurePlayer() {
    player.actionAtItemEnd = .advance
    env.configurePlayer(player)
    playerObservations = [
      player.observe(\.timeControlStatus, options: [.new]) { @Sendable [weak self] _, _ in
        dispatchToMain { [weak self] in self?.timeControlStatusChanged() }
      },
      player.observe(\.currentItem, options: [.new]) { @Sendable [weak self] _, _ in
        dispatchToMain { [weak self] in self?.playerItemChanged() }
      },
    ]
  }

  private func itemStatusChanged(_ slot: Slot) {
    switch slot.item.status {
    case .failed:
      itemFailed(slot, code: .loadFailed, message: slot.item.error?.localizedDescription)
    case .readyToPlay:
      guard slot === current else { return }
      if let startPositionMs {
        issueSeek(to: startPositionMs, in: slot)
      }
      nowPlaying.updateTiming(elapsedMs: positionMs, durationMs: slot.durationMs, playing: status == .playing)
      emitState()
      emitProgress()
    default:
      break
    }
  }

  private func timeControlStatusChanged() {
    if player.timeControlStatus == .paused, playWhenReady, let current,
       player.currentItem === current.item, current.item.status == .readyToPlay,
       startPositionMs == nil, !ended, !failed {
      // Paused by the system rather than by us (e.g. on a route change):
      // follow it so the next toggle plays.
      playWhenReady = false
      pausedBySystem = true
    }
    updateListening()
    if let current, !ended {
      nowPlaying.updateTiming(elapsedMs: positionMs, durationMs: current.durationMs, playing: status == .playing)
    }
    emitState()
  }

  /// The queue player moved on by itself (gapless advance). The engine has
  /// usually adopted the new item already; refresh what depends on the
  /// player actually being on it. Ends and failures are handled by the item's
  /// own observers, never here.
  private func playerItemChanged() {
    guard let current, !ended, !failed, player.currentItem === current.item else { return }
    updateListening()
    nowPlaying.updateTiming(elapsedMs: positionMs, durationMs: current.durationMs, playing: status == .playing)
    emitState()
  }

  // MARK: - System

  private func handleRemote(_ command: RemoteCommand) -> Bool {
    switch command {
    case .play:
      guard !queue.isEmpty else { return false }
      play()
      return true
    case .pause:
      pause()
      return true
    case .toggle:
      guard !queue.isEmpty else { return false }
      toggle()
      return true
    case .next:
      return next()
    case .previous:
      return previous()
    case .seek(let positionMs):
      return seek(toMs: positionMs)
    }
  }

  func handleSession(_ event: AudioSessionEvent) {
    switch event {
    case .interruptionBegan:
      let wasPlaying = (playWhenReady || pausedBySystem) && !ended && !failed
      setPlayWhenReady(false)
      resumeAfterInterruption = wasPlaying
    case .interruptionEnded(let shouldResume):
      let resume = shouldResume && resumeAfterInterruption
      resumeAfterInterruption = false
      if resume { play() }
    case .outputLost:
      pause()
    case .mediaServicesReset:
      rebuildPlayer()
    }
  }

  /// After a media services reset every AVFoundation object is invalid:
  /// make a new player and reload the current item where it was, paused.
  private func rebuildPlayer() {
    let observed = progressObserver != nil
    setProgressObserved(false)
    playerObservations.forEach { $0.invalidate() }
    let position = positionMs
    let content = current?.content
    discardUpcoming()
    current?.invalidate()
    current = nil
    player.removeAllItems()
    player = AVQueuePlayer()
    configurePlayer()
    if observed { setProgressObserved(true) }
    playWhenReady = false
    if let content, !failed {
      activate(content, positionMs: ended ? 0 : position, mode: .jump, direction: .natural)
    }
    emitState()
  }

  private func setSkipAndSeekEnabled(_ enabled: Bool) {
    guard skipAndSeekEnabled != enabled else { return }
    skipAndSeekEnabled = enabled
    if env.installsRemoteCommands {
      remoteCommands.setSkipAndSeekEnabled(enabled)
    }
  }

  // MARK: - Listening counter

  private func updateListening() {
    let now = env.nowMs()
    let counting = interstitialConfig != nil && !ended && !failed
      && current?.isEntry == true
      && player.currentItem === current?.item
      && player.timeControlStatus == .playing
    if counting {
      counter.start(nowMs: now)
      scheduleDueCheck()
    } else {
      counter.stop(nowMs: now)
      cancelDueCheck()
    }
  }

  private func scheduleDueCheck() {
    cancelDueCheck()
    guard let interstitialConfig else { return }
    let remaining = interstitialConfig.afterListeningMs - counter.value(nowMs: env.nowMs())
    guard remaining > 0 else {
      // Already due: make sure the interstitial is the preloaded item.
      refreshUpcoming()
      return
    }
    let work = DispatchWorkItem { @Sendable [weak self] in
      MainActor.assumeIsolated { self?.dueCheckFired() }
    }
    dueCheck = work
    DispatchQueue.main.asyncAfter(deadline: .now() + .milliseconds(Int(remaining.rounded(.up)) + 1), execute: work)
  }

  private func dueCheckFired() {
    dueCheck = nil
    if isInterstitialDue {
      refreshUpcoming()
      emitState(force: true)
    } else {
      updateListening()
    }
  }

  private func cancelDueCheck() {
    dueCheck?.cancel()
    dueCheck = nil
  }

  // MARK: - Events

  private struct StateKey: Equatable {
    var status: PlaybackStatus
    var index: Int?
    var trackId: String?
    var repeatMode: RepeatMode
    var queueLength: Int
    var interstitial: Bool
  }

  private func emitState(force: Bool = false) {
    let snapshot = snapshot()
    let key = StateKey(
      status: snapshot.status,
      index: snapshot.index,
      trackId: snapshot.trackId,
      repeatMode: snapshot.repeatMode,
      queueLength: snapshot.queueLength,
      interstitial: snapshot.interstitial
    )
    guard force || key != lastState else { return }
    lastState = key
    emit(.state(snapshot))
  }

  private func emitProgress() {
    guard progressObserver != nil, current != nil else { return }
    emit(.progress(positionMs: positionMs, durationMs: current?.durationMs ?? 0))
  }

  private func emitQueue() {
    emit(.queue(length: queue.count, index: currentIndex))
  }

  private func emit(_ event: EngineEvent) {
    onEvent?(event)
  }

  private func publishNowPlayingItem() {
    guard let current else { return }
    nowPlaying.setItem(
      current.track,
      durationMs: current.durationMs,
      elapsedMs: positionMs,
      playing: status == .playing,
      queueIndex: isInterstitialActive ? nil : currentIndex,
      queueCount: queue.count
    )
  }
}
