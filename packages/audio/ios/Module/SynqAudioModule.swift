import ExpoModulesCore

// The Expo glue: converts arguments, forwards to the engine on the main queue,
// and turns engine events into JS events. No playback logic lives here.

struct TrackRecord: Record {
  @Field var id: String = ""
  @Field var url: String = ""
  @Field var title: String = ""
  @Field var artist: String = ""
  @Field var album: String?
  @Field var artworkUrl: String?
  @Field var durationMs: Double?
}

struct SetQueueOptions: Record {
  @Field var startIndex: Int = 0
  @Field var positionMs: Double?
  @Field var play: Bool?
}

struct InterstitialRecord: Record {
  @Field var track: TrackRecord = TrackRecord()
  @Field var afterListeningMs: Double = 0
  @Field var listenedMs: Double?
}

final class InvalidArgumentException: GenericException<String>, @unchecked Sendable {
  override var reason: String { "Invalid argument: \(param)" }
}

public final class SynqAudioModule: Module {
  /// Created and used only on the main queue.
  nonisolated(unsafe) private var engineInstance: AudioEngine?

  public func definition() -> ModuleDefinition {
    Name("SynqAudio")

    Events("state", "progress", "queue", "error", "interstitialStart", "interstitialEnd")

    OnStartObserving("progress") {
      self.onMainAsync { $0.setProgressObserved(true) }
    }

    OnStopObserving("progress") {
      self.onMainAsync { $0.setProgressObserved(false) }
    }

    AsyncFunction("setQueue") { (tracks: [TrackRecord], options: SetQueueOptions?) in
      let tracks = try tracks.map(Self.track(from:))
      self.onMain { engine in
        engine.setQueue(
          tracks,
          startIndex: options?.startIndex ?? 0,
          positionMs: options?.positionMs,
          play: options?.play
        )
      }
    }.runOnQueue(.main)

    AsyncFunction("insert") { (tracks: [TrackRecord], index: Int?) in
      let tracks = try tracks.map(Self.track(from:))
      self.onMain { $0.insert(tracks, at: index) }
    }.runOnQueue(.main)

    AsyncFunction("remove") { (indices: [Int]) in
      self.onMain { $0.remove(indices) }
    }.runOnQueue(.main)

    AsyncFunction("move") { (from: Int, to: Int) in
      self.onMain { $0.move(from: from, to: to) }
    }.runOnQueue(.main)

    AsyncFunction("play") {
      self.onMain { $0.play() }
    }.runOnQueue(.main)

    AsyncFunction("pause") {
      self.onMain { $0.pause() }
    }.runOnQueue(.main)

    AsyncFunction("toggle") {
      self.onMain { $0.toggle() }
    }.runOnQueue(.main)

    AsyncFunction("seekTo") { (positionMs: Double) -> Bool in
      self.onMain { $0.seek(toMs: positionMs) }
    }.runOnQueue(.main)

    AsyncFunction("next") { () -> Bool in
      self.onMain { $0.next() }
    }.runOnQueue(.main)

    AsyncFunction("previous") { () -> Bool in
      self.onMain { $0.previous() }
    }.runOnQueue(.main)

    AsyncFunction("skipTo") { (index: Int) -> Bool in
      self.onMain { $0.skip(to: index) }
    }.runOnQueue(.main)

    AsyncFunction("setRepeatMode") { (mode: String) in
      guard let mode = RepeatMode(rawValue: mode) else {
        throw InvalidArgumentException("unknown repeat mode \(mode)")
      }
      self.onMain { $0.setRepeatMode(mode) }
    }.runOnQueue(.main)

    AsyncFunction("configureInterstitial") { (config: InterstitialRecord?) in
      let interstitial = try config.map {
        InterstitialConfig(
          track: try Self.track(from: $0.track),
          afterListeningMs: $0.afterListeningMs,
          listenedMs: $0.listenedMs
        )
      }
      self.onMain { $0.configureInterstitial(interstitial) }
    }.runOnQueue(.main)

    AsyncFunction("getState") { () -> [String: Any?] in
      Self.payload(self.onMain { $0.snapshot() })
    }.runOnQueue(.main)

    AsyncFunction("getQueue") { () -> [String: Any?] in
      let (tracks, index) = self.onMain { ($0.tracks, $0.currentIndex) }
      return ["tracks": tracks.map(Self.payload), "index": index]
    }.runOnQueue(.main)

    OnDestroy {
      let module = ModuleBox(self)
      DispatchQueue.main.async {
        MainActor.assumeIsolated {
          module.value.engineInstance?.tearDown()
          module.value.engineInstance = nil
        }
      }
    }
  }

  // MARK: - Main queue

  /// Runs `body` with the engine. Callers are on the main queue
  /// (`runOnQueue(.main)`), which `assumeIsolated` checks.
  private func onMain<T: Sendable>(_ body: @MainActor (AudioEngine) -> T) -> T {
    MainActor.assumeIsolated { body(self.engine()) }
  }

  /// For hooks Expo calls off the main queue (observer start/stop).
  private func onMainAsync(_ body: @escaping @MainActor (AudioEngine) -> Void) {
    let module = ModuleBox(self)
    DispatchQueue.main.async {
      MainActor.assumeIsolated { body(module.value.engine()) }
    }
  }

  @MainActor
  private func engine() -> AudioEngine {
    if let engineInstance { return engineInstance }
    let engine = AudioEngine(environment: .live)
    engine.onEvent = { [weak self] event in self?.send(event) }
    engineInstance = engine
    return engine
  }

  // MARK: - Conversion

  private static func track(from record: TrackRecord) throws -> Track {
    guard !record.id.isEmpty else { throw InvalidArgumentException("missing id") }
    guard let url = fileURL(record.url) else { throw InvalidArgumentException("\(record.id) has no file URL") }
    return Track(
      id: record.id,
      url: url,
      title: record.title,
      artist: record.artist,
      album: record.album,
      artworkURL: record.artworkUrl.flatMap(fileURL),
      durationMs: record.durationMs
    )
  }

  /// Accepts `file://` URLs and absolute paths.
  private static func fileURL(_ string: String) -> URL? {
    if string.hasPrefix("/") { return URL(fileURLWithPath: string) }
    guard let url = URL(string: string), url.isFileURL else { return nil }
    return url
  }

  private static func payload(_ track: Track) -> [String: Any?] {
    [
      "id": track.id,
      "url": track.url.absoluteString,
      "title": track.title,
      "artist": track.artist,
      "album": track.album,
      "artworkUrl": track.artworkURL?.absoluteString,
      "durationMs": track.durationMs,
    ]
  }

  private static func payload(_ state: PlaybackSnapshot) -> [String: Any?] {
    [
      "status": state.status.rawValue,
      "index": state.index,
      "trackId": state.trackId,
      "positionMs": state.positionMs,
      "durationMs": state.durationMs,
      "repeatMode": state.repeatMode.rawValue,
      "queueLength": state.queueLength,
      "interstitial": state.interstitial,
      "listenedMs": state.listenedMs,
    ]
  }

  private func send(_ event: EngineEvent) {
    switch event {
    case .state(let state):
      sendEvent("state", Self.payload(state))
    case .progress(let positionMs, let durationMs):
      sendEvent("progress", ["positionMs": positionMs, "durationMs": durationMs])
    case .queue(let length, let index):
      sendEvent("queue", ["length": length, "index": index])
    case .error(let error):
      sendEvent("error", [
        "code": error.code.rawValue,
        "message": error.message,
        "trackId": error.trackId,
        "index": error.index,
      ])
    case .interstitialStart:
      sendEvent("interstitialStart", [:])
    case .interstitialEnd:
      sendEvent("interstitialEnd", ["listenedMs": 0])
    }
  }
}

/// Carries the module to the main queue; it is only used there.
private struct ModuleBox: @unchecked Sendable {
  let value: SynqAudioModule
  init(_ value: SynqAudioModule) { self.value = value }
}
