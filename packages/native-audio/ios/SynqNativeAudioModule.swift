import AVFoundation
import ExpoModulesCore
import MediaPlayer

public class SynqNativeAudioModule: Module {
  private var player: AVPlayer?
  private var timeObserver: Any?
  private var queue: [[String: Any]] = []
  private var activeTrackId: String?
  private var status = "idle"
  private var playbackRate: Float = 1

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
      self.queue = queuePayload["tracks"] as? [[String: Any]] ?? []
      self.activeTrackId = queuePayload["activeTrackId"] as? String
      if self.activeTrackId == nil {
        self.activeTrackId = self.queue.first?["id"] as? String
      }
      try self.loadActiveTrack(autoplay: false)
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
      self.emitStateChanged()
      return self.statePayload()
    }

    Function("skipPrevious") {
      self.activeTrackId = self.previousTrackId()
      try self.loadActiveTrack(autoplay: true)
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
    let commandCenter = MPRemoteCommandCenter.shared()

    commandCenter.playCommand.isEnabled = true
    commandCenter.pauseCommand.isEnabled = true
    commandCenter.togglePlayPauseCommand.isEnabled = true
    commandCenter.nextTrackCommand.isEnabled = true
    commandCenter.previousTrackCommand.isEnabled = true
    commandCenter.changePlaybackPositionCommand.isEnabled = true

    commandCenter.playCommand.addTarget { [weak self] _ in
      self?.sendRemoteCommand("play")
      return .success
    }
    commandCenter.pauseCommand.addTarget { [weak self] _ in
      self?.sendRemoteCommand("pause")
      return .success
    }
    commandCenter.togglePlayPauseCommand.addTarget { [weak self] _ in
      self?.sendRemoteCommand("togglePlayPause")
      return .success
    }
    commandCenter.nextTrackCommand.addTarget { [weak self] _ in
      self?.sendRemoteCommand("next")
      return .success
    }
    commandCenter.previousTrackCommand.addTarget { [weak self] _ in
      self?.sendRemoteCommand("previous")
      return .success
    }
    commandCenter.changePlaybackPositionCommand.addTarget { [weak self] event in
      guard let positionEvent = event as? MPChangePlaybackPositionCommandEvent else {
        return .commandFailed
      }
      self?.sendRemoteCommand("seek", positionMs: positionEvent.positionTime * 1000)
      return .success
    }
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

    let index = activeTrackIndex() ?? -1
    let nextIndex = index + 1
    return nextIndex < queue.count ? queue[nextIndex]["id"] as? String : nil
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
        "tracks": queue
      ],
      "status": status
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

  private func updateNowPlayingInfo() {
    guard let track = activeTrack() else {
      MPNowPlayingInfoCenter.default().nowPlayingInfo = nil
      return
    }

    MPNowPlayingInfoCenter.default().nowPlayingInfo = [
      MPMediaItemPropertyTitle: track["title"] as? String ?? "",
      MPMediaItemPropertyArtist: track["artistName"] as? String ?? "",
      MPMediaItemPropertyAlbumTitle: track["albumTitle"] as? String ?? "",
      MPMediaItemPropertyPlaybackDuration: durationMs() / 1000,
      MPNowPlayingInfoPropertyElapsedPlaybackTime: positionMs() / 1000,
      MPNowPlayingInfoPropertyPlaybackRate: status == "playing" ? playbackRate : 0
    ]
  }

  @objc private func handlePlayerItemDidEnd() {
    status = "ended"
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
