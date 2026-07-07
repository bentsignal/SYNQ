import AVFoundation
import ExpoModulesCore
import MediaPlayer
import UIKit

public class SynqNativeAudioModule: Module {
  private var player: AVPlayer?
  private var timeObserver: Any?
  private var queue: [[String: Any]] = []
  private var queueMode: [String: Bool] = [
    "loop": false,
    "shuffle": false
  ]
  private var artworkCache: [String: UIImage] = [:]
  private var activeTrackId: String?
  private var status = "idle"
  private var playbackRate: Float = 1
  private var notificationsConfigured = false
  private var remoteCommandsConfigured = false
  private var playCommandTarget: Any?
  private var pauseCommandTarget: Any?
  private var togglePlayPauseCommandTarget: Any?
  private var nextTrackCommandTarget: Any?
  private var previousTrackCommandTarget: Any?
  private var skipForwardCommandTarget: Any?
  private var skipBackwardCommandTarget: Any?
  private var changePlaybackPositionCommandTarget: Any?

  public func definition() -> ModuleDefinition {
    Name("SynqNativeAudio")

    Events("onChange", "onPlaybackEvent")

    Function("getModuleName") {
      return "SynqNativeAudio"
    }

    Function("configure") { (options: [String: Any]) in
      try self.configureAudioSession(options: options)
      self.configureRemoteCommands()
      self.configureNotifications()
      self.emitStateChanged()
      return self.statePayload()
    }

    Function("getState") {
      return self.statePayload()
    }

    Function("loadQueue") { (queuePayload: [String: Any]) in
      let previousActiveTrackId = self.activeTrackId
      self.queue = queuePayload["tracks"] as? [[String: Any]] ?? []
      self.queueMode = self.queueModeFromPayload(queuePayload["mode"])
      self.activeTrackId = queuePayload["activeTrackId"] as? String
      if self.activeTrackId == nil {
        self.activeTrackId = self.queue.first?["id"] as? String
      }
      if self.activeTrackId != previousActiveTrackId || self.player == nil {
        try self.loadActiveTrack(autoplay: false)
      } else {
        self.updateNowPlayingInfo()
      }
      self.emitStateChanged()
      return self.statePayload()
    }

    Function("play") { (trackId: String?) in
      if let trackId {
        self.activeTrackId = trackId
        try self.loadActiveTrack(autoplay: true)
      } else if self.player == nil {
        try self.loadActiveTrack(autoplay: true)
      } else if self.shouldRestartPlaybackFromBeginning() {
        try self.loadActiveTrack(autoplay: true)
      }
      self.status = "playing"
      self.player?.rate = self.playbackRate
      self.updateNowPlayingInfo()
      self.emitStateChanged()
      return self.statePayload()
    }

    Function("pause") {
      self.player?.pause()
      self.status = self.player == nil ? "idle" : "paused"
      self.updateNowPlayingInfo()
      self.emitStateChanged()
      return self.statePayload()
    }

    Function("stop") {
      self.player?.pause()
      self.player?.seek(to: .zero)
      self.activeTrackId = nil
      self.status = "idle"
      self.updateNowPlayingInfo()
      self.emitStateChanged()
      return self.statePayload()
    }

    Function("seekTo") { (positionMs: Double) in
      let seconds = max(0, positionMs / 1000)
      self.player?.seek(to: CMTime(seconds: seconds, preferredTimescale: 600))
      self.updateNowPlayingInfo()
      self.emitStateChanged()
      return self.statePayload()
    }

    Function("skipNext") {
      self.activeTrackId = self.nextTrackId()
      try self.loadActiveTrack(autoplay: true)
      self.updateNowPlayingInfo()
      self.emitStateChanged()
      return self.statePayload()
    }

    Function("skipPrevious") {
      self.activeTrackId = self.previousTrackId()
      try self.loadActiveTrack(autoplay: true)
      self.updateNowPlayingInfo()
      self.emitStateChanged()
      return self.statePayload()
    }

    Function("setQueueMode") { (modePayload: [String: Any]) in
      self.queueMode = self.queueModeFromPayload(modePayload)
      self.updateNowPlayingInfo()
      self.emitStateChanged()
      return self.statePayload()
    }

    Function("setPlaybackRate") { (rate: Double) in
      self.playbackRate = Float(max(0.25, min(rate, 4)))
      if self.status == "playing" {
        self.player?.rate = self.playbackRate
      }
      self.updateNowPlayingInfo()
      self.emitStateChanged()
      return self.statePayload()
    }

    OnDestroy {
      self.removeTimeObserver()
      self.removeRemoteCommandTargets()
      self.artworkCache.removeAll()
      NotificationCenter.default.removeObserver(self)
      MPNowPlayingInfoCenter.default().nowPlayingInfo = nil
    }
  }

  private func configureAudioSession(options: [String: Any]) throws {
    let session = AVAudioSession.sharedInstance()
    try session.setCategory(.playback, mode: .default, options: [])
    try session.setActive(true)
  }

  private func configureNotifications() {
    if notificationsConfigured {
      return
    }

    notificationsConfigured = true
    NotificationCenter.default.addObserver(
      self,
      selector: #selector(handlePlayerItemDidEnd),
      name: .AVPlayerItemDidPlayToEndTime,
      object: nil
    )
    NotificationCenter.default.addObserver(
      self,
      selector: #selector(handleInterruption),
      name: AVAudioSession.interruptionNotification,
      object: AVAudioSession.sharedInstance()
    )
    NotificationCenter.default.addObserver(
      self,
      selector: #selector(handleRouteChange),
      name: AVAudioSession.routeChangeNotification,
      object: AVAudioSession.sharedInstance()
    )
  }

  private func configureRemoteCommands() {
    if remoteCommandsConfigured {
      return
    }

    remoteCommandsConfigured = true
    let commandCenter = MPRemoteCommandCenter.shared()

    commandCenter.playCommand.isEnabled = true
    commandCenter.pauseCommand.isEnabled = true
    commandCenter.togglePlayPauseCommand.isEnabled = true
    commandCenter.nextTrackCommand.isEnabled = true
    commandCenter.previousTrackCommand.isEnabled = true
    commandCenter.skipForwardCommand.isEnabled = true
    commandCenter.skipForwardCommand.preferredIntervals = [NSNumber(value: 15)]
    commandCenter.skipBackwardCommand.isEnabled = true
    commandCenter.skipBackwardCommand.preferredIntervals = [NSNumber(value: 15)]
    commandCenter.changePlaybackPositionCommand.isEnabled = true

    playCommandTarget = commandCenter.playCommand.addTarget { [weak self] _ in
      self?.handleRemotePlay()
      return self?.player == nil ? .commandFailed : .success
    }
    pauseCommandTarget = commandCenter.pauseCommand.addTarget { [weak self] _ in
      self?.handleRemotePause()
      return .success
    }
    togglePlayPauseCommandTarget = commandCenter.togglePlayPauseCommand.addTarget { [weak self] _ in
      self?.handleRemoteTogglePlayPause()
      return .success
    }
    nextTrackCommandTarget = commandCenter.nextTrackCommand.addTarget { [weak self] _ in
      self?.handleRemoteSkipNext()
      return .success
    }
    previousTrackCommandTarget = commandCenter.previousTrackCommand.addTarget { [weak self] _ in
      self?.handleRemoteSkipPrevious()
      return .success
    }
    skipForwardCommandTarget = commandCenter.skipForwardCommand.addTarget { [weak self] event in
      self?.sendRelativeSeekCommand(event: event, direction: 1)
      return .success
    }
    skipBackwardCommandTarget = commandCenter.skipBackwardCommand.addTarget { [weak self] event in
      self?.sendRelativeSeekCommand(event: event, direction: -1)
      return .success
    }
    changePlaybackPositionCommandTarget = commandCenter.changePlaybackPositionCommand.addTarget { [weak self] event in
      guard let positionEvent = event as? MPChangePlaybackPositionCommandEvent else {
        return .commandFailed
      }
      self?.handleRemoteSeek(positionMs: positionEvent.positionTime * 1000)
      return .success
    }
  }

  private func removeRemoteCommandTargets() {
    if !remoteCommandsConfigured {
      return
    }

    let commandCenter = MPRemoteCommandCenter.shared()
    if let playCommandTarget {
      commandCenter.playCommand.removeTarget(playCommandTarget)
    }
    if let pauseCommandTarget {
      commandCenter.pauseCommand.removeTarget(pauseCommandTarget)
    }
    if let togglePlayPauseCommandTarget {
      commandCenter.togglePlayPauseCommand.removeTarget(togglePlayPauseCommandTarget)
    }
    if let nextTrackCommandTarget {
      commandCenter.nextTrackCommand.removeTarget(nextTrackCommandTarget)
    }
    if let previousTrackCommandTarget {
      commandCenter.previousTrackCommand.removeTarget(previousTrackCommandTarget)
    }
    if let skipForwardCommandTarget {
      commandCenter.skipForwardCommand.removeTarget(skipForwardCommandTarget)
    }
    if let skipBackwardCommandTarget {
      commandCenter.skipBackwardCommand.removeTarget(skipBackwardCommandTarget)
    }
    if let changePlaybackPositionCommandTarget {
      commandCenter.changePlaybackPositionCommand.removeTarget(changePlaybackPositionCommandTarget)
    }

    playCommandTarget = nil
    pauseCommandTarget = nil
    togglePlayPauseCommandTarget = nil
    nextTrackCommandTarget = nil
    previousTrackCommandTarget = nil
    skipForwardCommandTarget = nil
    skipBackwardCommandTarget = nil
    changePlaybackPositionCommandTarget = nil
    remoteCommandsConfigured = false
  }

  private func loadActiveTrack(autoplay: Bool) throws {
    guard let track = activeTrack(), let uri = track["uri"] as? String else {
      player = nil
      status = "idle"
      return
    }

    guard let url = urlFromTrackUri(uri) else {
      throw NSError(
        domain: "SynqNativeAudio",
        code: 1,
        userInfo: [NSLocalizedDescriptionKey: "Invalid track URI: \(uri)"]
      )
    }

    removeTimeObserver()
    let item = AVPlayerItem(url: url)
    player = AVPlayer(playerItem: item)
    addTimeObserver()
    status = autoplay ? "playing" : "paused"
    updateNowPlayingInfo()

    if autoplay {
      player?.rate = playbackRate
    }
  }

  private func urlFromTrackUri(_ uri: String) -> URL? {
    if uri.hasPrefix("file://") || uri.hasPrefix("http://") || uri.hasPrefix("https://") {
      return URL(string: uri)
    }

    if uri.hasPrefix("/") {
      return URL(fileURLWithPath: uri)
    }

    return URL(string: uri)
  }

  private func addTimeObserver() {
    guard let player else {
      return
    }

    timeObserver = player.addPeriodicTimeObserver(
      forInterval: CMTime(seconds: 1, preferredTimescale: 2),
      queue: .main
    ) { [weak self] _ in
      self?.emitStateChanged()
      self?.updateNowPlayingInfo()
    }
  }

  private func removeTimeObserver() {
    if let timeObserver {
      player?.removeTimeObserver(timeObserver)
      self.timeObserver = nil
    }
  }

  private func activeTrack() -> [String: Any]? {
    guard let activeTrackId else {
      return nil
    }

    return queue.first { track in
      track["id"] as? String == activeTrackId
    }
  }

  private func activeTrackIndex() -> Int? {
    guard let activeTrackId else {
      return nil
    }

    return queue.firstIndex { track in
      track["id"] as? String == activeTrackId
    }
  }

  private func nextTrackId() -> String? {
    guard !queue.isEmpty else {
      return nil
    }

    if queueMode["shuffle"] == true {
      let activeIndex = activeTrackIndex()
      let playableTracks = queue.enumerated().filter { index, _ in
        activeIndex == nil || index != activeIndex
      }.map { _, track in track }

      if let randomTrack = playableTracks.randomElement() {
        return randomTrack["id"] as? String
      }

      return queueMode["loop"] == true ? queue.first?["id"] as? String : nil
    }

    let index = activeTrackIndex() ?? -1
    let nextIndex = index + 1
    if nextIndex < queue.count {
      return queue[nextIndex]["id"] as? String
    }

    return queueMode["loop"] == true ? queue.first?["id"] as? String : nil
  }

  private func previousTrackId() -> String? {
    guard !queue.isEmpty else {
      return nil
    }

    let index = activeTrackIndex() ?? 0
    return queue[max(0, index - 1)]["id"] as? String
  }

  private func durationMs() -> Double {
    if let duration = activeTrack()?["durationMs"] as? Double {
      return duration
    }

    let seconds = player?.currentItem?.duration.seconds ?? 0
    return seconds.isFinite ? seconds * 1000 : 0
  }

  private func positionMs() -> Double {
    let seconds = player?.currentTime().seconds ?? 0
    return seconds.isFinite && seconds >= 0 ? seconds * 1000 : 0
  }

  private func bufferedPositionMs() -> Double {
    guard let range = player?.currentItem?.loadedTimeRanges.first?.timeRangeValue else {
      return 0
    }

    let seconds = CMTimeGetSeconds(range.start) + CMTimeGetSeconds(range.duration)
    return seconds.isFinite && seconds >= 0 ? seconds * 1000 : 0
  }

  private func shouldRestartPlaybackFromBeginning() -> Bool {
    if status == "ended" {
      return true
    }

    let duration = durationMs()
    return duration > 0 && positionMs() >= duration - 250
  }

  private func statePayload() -> [String: Any] {
    let activeTrackIdPayload: Any = activeTrackId ?? NSNull()

    return [
      "activeTrack": activeTrack() ?? NSNull(),
      "bufferedPositionMs": bufferedPositionMs(),
      "durationMs": durationMs(),
      "playbackRate": playbackRate,
      "positionMs": positionMs(),
      "queue": [
        "activeTrackId": activeTrackIdPayload,
        "mode": queueMode,
        "tracks": queue
      ],
      "status": status
    ]
  }

  private func queueModeFromPayload(_ payload: Any?) -> [String: Bool] {
    let mode = payload as? [String: Any] ?? [:]

    return [
      "loop": mode["loop"] as? Bool ?? false,
      "shuffle": mode["shuffle"] as? Bool ?? false
    ]
  }

  private func emitStateChanged() {
    sendEvent("onPlaybackEvent", [
      "type": "StateChanged",
      "state": statePayload()
    ])
  }

  private func sendRemoteCommand(_ command: String, positionMs: Double? = nil) {
    var payload: [String: Any] = [
      "type": "RemoteCommand",
      "command": command
    ]

    if let positionMs {
      payload["positionMs"] = positionMs
    }

    sendEvent("onPlaybackEvent", payload)
  }

  private func handleRemotePlay() {
    if player == nil {
      try? loadActiveTrack(autoplay: true)
    }

    guard player != nil else {
      sendRemoteCommand("play")
      return
    }

    status = "playing"
    player?.rate = playbackRate
    updateNowPlayingInfo()
    emitStateChanged()
    sendRemoteCommand("play")
  }

  private func handleRemotePause() {
    player?.pause()
    status = player == nil ? "idle" : "paused"
    updateNowPlayingInfo()
    emitStateChanged()
    sendRemoteCommand("pause")
  }

  private func handleRemoteTogglePlayPause() {
    if status == "playing" {
      player?.pause()
      status = player == nil ? "idle" : "paused"
      updateNowPlayingInfo()
      emitStateChanged()
      sendRemoteCommand("pause")
      return
    }

    if player == nil {
      try? loadActiveTrack(autoplay: true)
    }

    if player != nil {
      status = "playing"
      player?.rate = playbackRate
      updateNowPlayingInfo()
      emitStateChanged()
    }

    sendRemoteCommand("play")
  }

  private func handleRemoteSkipNext() {
    let targetTrackId = nextTrackId()
    activeTrackId = targetTrackId

    if targetTrackId == nil {
      player?.pause()
      player?.seek(to: .zero)
      removeTimeObserver()
      player = nil
      status = "idle"
    } else {
      try? loadActiveTrack(autoplay: true)
      status = "playing"
      player?.rate = playbackRate
    }

    updateNowPlayingInfo()
    emitStateChanged()
    sendRemoteCommand("next")
  }

  private func handleRemoteSkipPrevious() {
    if positionMs() >= 3000 {
      player?.seek(to: .zero)
      updateNowPlayingInfo()
      emitStateChanged()
      sendRemoteCommand("previous")
      return
    }

    activeTrackId = previousTrackId()
    try? loadActiveTrack(autoplay: true)
    status = player == nil ? "idle" : "playing"
    player?.rate = playbackRate
    updateNowPlayingInfo()
    emitStateChanged()
    sendRemoteCommand("previous")
  }

  private func handleRemoteSeek(positionMs: Double) {
    let duration = durationMs()
    let target: Double
    if duration > 0 {
      target = min(duration, max(0, positionMs))
    } else {
      target = max(0, positionMs)
    }

    player?.seek(to: CMTime(seconds: target / 1000, preferredTimescale: 600))
    updateNowPlayingInfo()
    emitStateChanged()
    sendRemoteCommand("seek", positionMs: target)
  }

  private func sendRelativeSeekCommand(event: MPRemoteCommandEvent, direction: Double) {
    let interval =
      (event as? MPSkipIntervalCommandEvent)?.interval
      ?? MPRemoteCommandCenter.shared().skipForwardCommand.preferredIntervals.first?.doubleValue
      ?? 15
    let duration = durationMs()
    let target = positionMs() + (direction * interval * 1000)
    let clampedTarget: Double
    if duration > 0 {
      clampedTarget = min(duration, max(0, target))
    } else {
      clampedTarget = max(0, target)
    }

    handleRemoteSeek(positionMs: clampedTarget)
  }

  private func updateNowPlayingInfo() {
    guard let track = activeTrack() else {
      MPNowPlayingInfoCenter.default().nowPlayingInfo = nil
      return
    }

    var nowPlayingInfo: [String: Any] = [
      MPMediaItemPropertyTitle: track["title"] as? String ?? "",
      MPMediaItemPropertyArtist: track["artistName"] as? String ?? "",
      MPMediaItemPropertyAlbumTitle: track["albumTitle"] as? String ?? "",
      MPMediaItemPropertyPlaybackDuration: durationMs() / 1000,
      MPNowPlayingInfoPropertyElapsedPlaybackTime: positionMs() / 1000,
      MPNowPlayingInfoPropertyPlaybackRate: status == "playing" ? playbackRate : 0
    ]

    if let artwork = artworkFromTrack(track) {
      nowPlayingInfo[MPMediaItemPropertyArtwork] = artwork
    }

    MPNowPlayingInfoCenter.default().nowPlayingInfo = nowPlayingInfo
  }

  private func artworkFromTrack(_ track: [String: Any]) -> MPMediaItemArtwork? {
    guard
      let artworkUri = track["artworkUri"] as? String,
      let url = urlFromTrackUri(artworkUri)
    else {
      return nil
    }

    if let cachedImage = artworkCache[artworkUri] {
      return MPMediaItemArtwork(boundsSize: cachedImage.size) { _ in cachedImage }
    }

    guard let image = imageFromArtworkUrl(url) else {
      return nil
    }

    artworkCache[artworkUri] = image

    return MPMediaItemArtwork(boundsSize: image.size) { _ in image }
  }

  private func imageFromArtworkUrl(_ url: URL) -> UIImage? {
    if url.isFileURL {
      return UIImage(contentsOfFile: url.path)
    }

    guard
      url.scheme == "http" || url.scheme == "https",
      let data = try? Data(contentsOf: url)
    else {
      return nil
    }

    return UIImage(data: data)
  }

  @objc private func handlePlayerItemDidEnd() {
    status = "ended"
    updateNowPlayingInfo()
    emitStateChanged()
  }

  @objc private func handleInterruption(notification: Notification) {
    guard
      let userInfo = notification.userInfo,
      let typeValue = userInfo[AVAudioSessionInterruptionTypeKey] as? UInt,
      let type = AVAudioSession.InterruptionType(rawValue: typeValue)
    else {
      return
    }

    switch type {
    case .began:
      sendEvent("onPlaybackEvent", ["type": "InterruptionBegan"])
    case .ended:
      let optionsValue = userInfo[AVAudioSessionInterruptionOptionKey] as? UInt ?? 0
      let options = AVAudioSession.InterruptionOptions(rawValue: optionsValue)
      sendEvent("onPlaybackEvent", [
        "type": "InterruptionEnded",
        "shouldResume": options.contains(.shouldResume)
      ])
    @unknown default:
      break
    }
  }

  @objc private func handleRouteChange(notification: Notification) {
    let reasonValue =
      notification.userInfo?[AVAudioSessionRouteChangeReasonKey] as? UInt ?? 0
    sendEvent("onPlaybackEvent", [
      "type": "RouteChanged",
      "reason": String(reasonValue)
    ])
  }
}
