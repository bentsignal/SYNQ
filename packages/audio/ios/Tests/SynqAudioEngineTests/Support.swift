import AVFoundation
import XCTest

@testable import SynqAudioEngine

/// Real audio files on disk, generated once per test run with AVAudioFile
/// (AAC in .m4a, like most imported music). They are silent so the suite can
/// run on a shared machine without making noise.
enum Fixtures {
  static let directory: URL = {
    let url = FileManager.default.temporaryDirectory
      .appendingPathComponent("synq-audio-tests-\(ProcessInfo.processInfo.processIdentifier)", isDirectory: true)
    try? FileManager.default.createDirectory(at: url, withIntermediateDirectories: true)
    return url
  }()

  static func audio(_ name: String, seconds: Double) -> URL {
    let url = directory.appendingPathComponent("\(name).m4a")
    if FileManager.default.fileExists(atPath: url.path) { return url }
    do {
      try writeSilence(to: url, seconds: seconds)
    } catch {
      fatalError("Couldn't write fixture \(name): \(error)")
    }
    return url
  }

  /// Bytes that aren't audio, with an audio extension.
  static var corrupt: URL {
    let url = directory.appendingPathComponent("corrupt.m4a")
    if !FileManager.default.fileExists(atPath: url.path) {
      let bytes = (0..<64 * 1024).map { UInt8(truncatingIfNeeded: $0 &* 31 &+ 7) }
      FileManager.default.createFile(atPath: url.path, contents: Data(bytes))
    }
    return url
  }

  static var missing: URL {
    directory.appendingPathComponent("does-not-exist.m4a")
  }

  private static func writeSilence(to url: URL, seconds: Double) throws {
    let sampleRate = 44_100.0
    let settings: [String: Any] = [
      AVFormatIDKey: kAudioFormatMPEG4AAC,
      AVSampleRateKey: sampleRate,
      AVNumberOfChannelsKey: 2,
      AVEncoderBitRateKey: 128_000,
    ]
    let file = try AVAudioFile(forWriting: url, settings: settings, commonFormat: .pcmFormatFloat32, interleaved: false)
    let frames = AVAudioFrameCount(seconds * sampleRate)
    guard let buffer = AVAudioPCMBuffer(pcmFormat: file.processingFormat, frameCapacity: frames) else {
      throw CocoaError(.fileWriteUnknown)
    }
    buffer.frameLength = frames
    try file.write(from: buffer)
  }
}

func track(_ id: String, _ url: URL, durationMs: Double? = nil) -> Track {
  Track(id: id, url: url, title: "Track \(id)", artist: "Artist", album: "Album", durationMs: durationMs)
}

enum Tracks {
  static var a: Track { track("a", Fixtures.audio("a", seconds: 1.0)) }
  static var b: Track { track("b", Fixtures.audio("b", seconds: 1.0)) }
  static var c: Track { track("c", Fixtures.audio("c", seconds: 1.0)) }
  static var long: Track { track("long", Fixtures.audio("long", seconds: 6.0)) }
  static var long2: Track { track("long2", Fixtures.audio("long2", seconds: 6.0)) }
  static var ad: Track { track("ad", Fixtures.audio("ad", seconds: 0.8)) }
  static var missing: Track { track("missing", Fixtures.missing) }
  static var corrupt: Track { track("corrupt", Fixtures.corrupt) }
}

/// Records what the engine sends out.
@MainActor
final class Recorder {
  var events: [EngineEvent] = []
  var nowPlaying: [[String: Any]?] = []

  var states: [PlaybackSnapshot] {
    events.compactMap { if case .state(let state) = $0 { return state } else { return nil } }
  }

  var errors: [PlaybackError] {
    events.compactMap { if case .error(let error) = $0 { return error } else { return nil } }
  }

  var progressCount: Int {
    events.filter { if case .progress = $0 { return true } else { return false } }.count
  }

  func count(_ event: EngineEvent) -> Int {
    events.filter { $0 == event }.count
  }

  /// Track ids in the order they started playing, without repeats in a row.
  var playedTrackIds: [String] {
    var ids: [String] = []
    for state in states where state.status == .playing {
      if let id = state.trackId, ids.last != id { ids.append(id) }
    }
    return ids
  }
}

@MainActor
class EngineTestCase: XCTestCase {
  private(set) var engine: AudioEngine!
  private(set) var recorder: Recorder!

  override func setUp() {
    super.setUp()
    MainActor.assumeIsolated {
      let recorder = Recorder()
      let environment = EngineEnvironment(
        publishNowPlaying: { recorder.nowPlaying.append($0) },
        loadsArtwork: false,
        installsRemoteCommands: false,
        managesAudioSession: false,
        nowMs: { ProcessInfo.processInfo.systemUptime * 1000 },
        fileExists: { FileManager.default.fileExists(atPath: $0.path) },
        configurePlayer: { player in
          player.volume = 0
          // e.g. SYNQ_AUDIO_TEST_OUTPUT=BuiltInSpeakerDevice when the default
          // output (an external interface) is asleep or wedged.
          if let device = ProcessInfo.processInfo.environment["SYNQ_AUDIO_TEST_OUTPUT"] {
            player.audioOutputDeviceUniqueID = device
          }
        }
      )
      let engine = AudioEngine(environment: environment)
      engine.onEvent = { recorder.events.append($0) }
      self.engine = engine
      self.recorder = recorder
    }
  }

  override func tearDown() {
    MainActor.assumeIsolated {
      engine.tearDown()
      engine = nil
      recorder = nil
    }
    super.tearDown()
  }

  /// Spins the main run loop until `condition` holds.
  func waitUntil(
    _ description: String,
    timeout: TimeInterval = 6,
    file: StaticString = #filePath,
    line: UInt = #line,
    _ condition: () -> Bool
  ) {
    let deadline = Date().addingTimeInterval(timeout)
    while !condition() {
      if Date() > deadline {
        XCTFail("Timed out waiting for \(description). State: \(engine.snapshot())", file: file, line: line)
        return
      }
      RunLoop.main.run(until: Date().addingTimeInterval(0.005))
    }
  }

  /// Spins the main run loop for a while.
  func run(for seconds: TimeInterval) {
    let deadline = Date().addingTimeInterval(seconds)
    while Date() < deadline {
      RunLoop.main.run(until: Date().addingTimeInterval(0.005))
    }
  }

  func waitForStatus(_ status: PlaybackStatus, timeout: TimeInterval = 6, file: StaticString = #filePath, line: UInt = #line) {
    waitUntil("status \(status)", timeout: timeout, file: file, line: line) { engine.status == status }
  }

  var upcomingIndex: Int? {
    guard case .entry(let key)? = engine.upcoming?.content else { return nil }
    return engine.queue.index(of: key)
  }

  /// The player's own item list matches the engine's current + upcoming.
  func assertPlayerItemsMatchSlots(file: StaticString = #filePath, line: UInt = #line) {
    let items = engine.player.items()
    var expected: [AVPlayerItem] = []
    if let current = engine.current { expected.append(current.item) }
    if let upcoming = engine.upcoming { expected.append(upcoming.item) }
    XCTAssertEqual(items.count, expected.count, "player items", file: file, line: line)
    for (item, expectedItem) in zip(items, expected) {
      XCTAssertTrue(item === expectedItem, "player item identity", file: file, line: line)
    }
  }
}
