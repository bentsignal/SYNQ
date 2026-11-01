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

  /// The queue entry playback is on. Kept after the queue ends or fails.
  private var currentKey: EntryKey?
  /// The item in the player for `currentKey`.
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
    let liveKey = ended || failed ? nil : currentKey
    let keep = liveKey != nil && liveKey.flatMap { queue.entry(for: $0) }?.track.id == tracks[start].id

    queue.replace(with: tracks, reusing: keep ? liveKey : nil, at: start)
    failedKeys.removeAll()
    guard let key = queue.entry(at: start)?.key else { return }

    if keep {
      if let current, current.key == key, current.track != tracks[start] {
        current.track = tracks[start]
        publishNowPlayingItem()
      }
      if let positionMs { _ = seekCurrent(to: positionMs) }
      if let play { setPlayWhenReady(play) }
      refreshUpcoming()
      nowPlaying.updateQueue(index: currentIndex, count: queue.count)
    } else {
      playWhenReady = play ?? true
      transition(to: key, positionMs: positionMs ?? 0, direction: .natural)
    }
    emitQueue()
    emitState()
  }

  /// Inserts tracks before `index` (default: the end). The current item keeps
  /// playing. Inserting into an empty queue loads the first track, paused.
  public func insert(_ tracks: [Track], at index: Int? = nil) {
    guard !tracks.isEmpty else { return }
    let wasEmpty = queue.isEmpty
    queue.insert(tracks, at: index ?? queue.count)
    if wasEmpty || currentKey == nil, let first = queue.entry(at: 0) {
      playWhenReady = false
      currentKey = first.key
      activate(first.key, positionMs: 0, mode: .jump, direction: .natural)
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
      if let replacement {
        currentKey = replacement.key
        activate(replacement.key, positionMs: 0, mode: .jump, direction: .natural)
      } else if let last = queue.entry(at: queue.count - 1) {
        // The last entry was playing and nothing follows: stop on the new last.
        playWhenReady = false
        currentKey = last.key
        activate(last.key, positionMs: 0, mode: .jump, direction: .natural)
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
      transition(to: key, positionMs: 0, direction: .natural)
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

  /// Seeks the current item. Returns false when nothing is loaded.
  @discardableResult
  public func seek(toMs positionMs: Double) -> Bool {
    seekCurrent(to: positionMs)
  }

  /// Goes to the next entry (wrapping when repeat is on). Returns false at the
  /// end of the queue with repeat off.
  @discardableResult
  public func next() -> Bool {
    guard let key = currentKey else { return false }
    let isPlayable = playableCheck
    guard let target = queue.neighbor(of: key, direction: .next, repeatMode: repeatMode, isPlayable: isPlayable) else {
      return false
    }
    playWhenReady = true
    transition(to: target, positionMs: 0, direction: .next)
    emitState()
    return true
  }

  /// Restarts the track after 3 seconds of it (or on the first entry), else
  /// goes to the previous entry.
  @discardableResult
  public func previous() -> Bool {
    guard let key = currentKey else { return false }
    let isPlayable = playableCheck
    let target = queue.neighbor(of: key, direction: .previous, repeatMode: repeatMode, isPlayable: isPlayable)
    if positionMs >= Self.previousRestartThresholdMs || target == nil {
      return seekCurrent(to: 0)
    }
    guard let target else { return false }
    playWhenReady = true
    transition(to: target, positionMs: 0, direction: .previous)
    emitState()
    return true
  }

  /// Plays the entry at `index`. Returns false for an invalid index.
  @discardableResult
  public func skip(to index: Int) -> Bool {
    guard let entry = queue.entry(at: index) else { return false }
    // An explicit choice retries an entry that failed before.
    failedKeys.remove(entry.key)
    playWhenReady = true
    transition(to: entry.key, positionMs: 0, direction: .natural)
    emitState()
    return true
  }

  public func setRepeatMode(_ mode: RepeatMode) {
    guard mode != repeatMode else { return }
    repeatMode = mode
    refreshUpcoming()
    emitState()
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
      queueLength: queue.count
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

  /// Moves playback to `key`.
  private func transition(to key: EntryKey, positionMs: Double, direction: PlaybackQueue.Direction) {
    currentKey = key
    activate(key, positionMs: positionMs, mode: .jump, direction: direction)
  }

  /// Makes `key`'s entry the current item: the preloaded one when it
  /// matches, else a freshly loaded one.
  private func activate(_ key: EntryKey, positionMs: Double, mode: ActivationMode, direction: PlaybackQueue.Direction) {
    let previous = current
    ended = false
    failed = false
    pausedBySystem = false
    startPositionMs = nil
    seekingToMs = nil
    seekGeneration &+= 1

    if positionMs <= 0, let upcoming, upcoming.key == key, upcoming.item.status != .failed,
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
    guard let slot = makeSlot(key) else {
      unplayable(key, direction: direction)
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
    guard current != nil else { return }
    applyPlayIntent()
    refreshUpcoming()
    publishNowPlayingItem()
    emitState()
    emitProgress()
  }

  /// The current item played to its end.
  private func itemDidEnd(_ slot: Slot) {
    guard slot === current, !ended, !failed else { return }
    let isPlayable = playableCheck
    guard let follower = queue.neighbor(of: slot.key, direction: .natural, repeatMode: repeatMode, isPlayable: isPlayable) else {
      finishQueue()
      return
    }
    currentKey = follower
    activate(follower, positionMs: 0, mode: .natural, direction: .natural)
  }

  private func itemFailed(_ slot: Slot, code: PlaybackError.Code, message: String?) {
    if slot === upcoming {
      // Found while preloading: report it now and preload what comes after.
      markUnplayable(slot.key, track: slot.track, code: code, message: message)
      discardUpcoming()
      refreshUpcoming()
      return
    }
    guard slot === current else { return }
    markUnplayable(slot.key, track: slot.track, code: code, message: message)
    unplayable(slot.key, direction: .natural)
  }

  /// `key`'s entry can't play (already reported): move past it.
  private func unplayable(_ key: EntryKey, direction: PlaybackQueue.Direction) {
    let isPlayable = playableCheck
    let follower = queue.neighbor(of: key, direction: direction, repeatMode: repeatMode, isPlayable: isPlayable)
      ?? queue.neighbor(of: key, direction: .natural, repeatMode: repeatMode, isPlayable: isPlayable)
    if let follower {
      currentKey = follower
      activate(follower, positionMs: 0, mode: .jump, direction: direction)
    } else {
      failQueue(at: key)
    }
  }

  /// Records a failure and emits the error event.
  private func markUnplayable(_ key: EntryKey, track: Track, code: PlaybackError.Code, message: String?) {
    failedKeys.insert(key)
    emit(.error(PlaybackError(
      code: code,
      message: message ?? "Couldn't play \(track.title).",
      trackId: track.id,
      index: queue.index(of: key)
    )))
  }

  private func makeSlot(_ key: EntryKey) -> Slot? {
    guard let track = queue.entry(for: key)?.track else { return nil }
    guard env.fileExists(track.url) else {
      markUnplayable(key, track: track, code: .fileMissing, message: "\(track.title) is missing its file.")
      return nil
    }
    let slot = Slot(key: key, track: track)
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
      if let upcoming, upcoming.key == desired, upcoming.item.status != .failed { return }
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

  private func desiredUpcoming(after current: Slot) -> EntryKey? {
    queue.neighbor(of: current.key, direction: .natural, repeatMode: repeatMode, isPlayable: playableCheck)
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
    nowPlaying.clear()
    emitState()
  }

  private func clear() {
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
      activate(current.key, positionMs: target, mode: .jump, direction: .natural)
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
    let key = current?.key
    discardUpcoming()
    current?.invalidate()
    current = nil
    player.removeAllItems()
    player = AVQueuePlayer()
    configurePlayer()
    if observed { setProgressObserved(true) }
    playWhenReady = false
    if let key, !failed {
      activate(key, positionMs: ended ? 0 : position, mode: .jump, direction: .natural)
    }
    emitState()
  }

  // MARK: - Events

  private struct StateKey: Equatable {
    var status: PlaybackStatus
    var index: Int?
    var trackId: String?
    var repeatMode: RepeatMode
    var queueLength: Int
  }

  private func emitState() {
    let snapshot = snapshot()
    let key = StateKey(
      status: snapshot.status,
      index: snapshot.index,
      trackId: snapshot.trackId,
      repeatMode: snapshot.repeatMode,
      queueLength: snapshot.queueLength
    )
    guard key != lastState else { return }
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
      queueIndex: currentIndex,
      queueCount: queue.count
    )
  }
}
