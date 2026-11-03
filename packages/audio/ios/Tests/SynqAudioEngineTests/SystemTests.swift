import MediaPlayer
import XCTest

@testable import SynqAudioEngine

/// Now Playing, progress, interruptions and route changes.
final class SystemTests: EngineTestCase {
  func testNowPlayingIsPublishedOnChangesNotOnATimer() {
    engine.setQueue([Tracks.long, Tracks.b], play: true)
    waitForStatus(.playing)
    run(for: 0.2)
    let info = recorder.nowPlaying.last.flatMap { $0 }
    XCTAssertEqual(info?[MPMediaItemPropertyTitle] as? String, "Track long")
    XCTAssertEqual(info?[MPMediaItemPropertyArtist] as? String, "Artist")
    XCTAssertEqual(info?[MPNowPlayingInfoPropertyPlaybackRate] as? Double, 1)
    XCTAssertEqual(info?[MPMediaItemPropertyPlaybackDuration] as? Double ?? 0, 6, accuracy: 0.1)
    XCTAssertEqual(info?[MPNowPlayingInfoPropertyPlaybackQueueIndex] as? Int, 0)
    XCTAssertEqual(info?[MPNowPlayingInfoPropertyPlaybackQueueCount] as? Int, 2)

    let published = recorder.nowPlaying.count
    run(for: 1.5)
    XCTAssertEqual(recorder.nowPlaying.count, published, "nothing changed, nothing published")

    engine.pause()
    waitForStatus(.paused)
    let paused = recorder.nowPlaying.last.flatMap { $0 }
    XCTAssertEqual(paused?[MPNowPlayingInfoPropertyPlaybackRate] as? Double, 0)

    engine.seek(toMs: 4000)
    let seeked = recorder.nowPlaying.last.flatMap { $0 }
    XCTAssertEqual(seeked?[MPNowPlayingInfoPropertyElapsedPlaybackTime] as? Double ?? 0, 4, accuracy: 0.01)
  }

  func testNowPlayingFollowsTheItem() {
    engine.setQueue([Tracks.a, Tracks.b], play: true)
    waitUntil("b") { engine.snapshot().trackId == "b" }
    let info = recorder.nowPlaying.last.flatMap { $0 }
    XCTAssertEqual(info?[MPMediaItemPropertyTitle] as? String, "Track b")
    XCTAssertEqual(info?[MPNowPlayingInfoPropertyPlaybackQueueIndex] as? Int, 1)
  }

  func testProgressIsEmittedOnlyWhileObserved() {
    engine.setQueue([Tracks.long], play: true)
    waitForStatus(.playing)
    run(for: 1.2)
    XCTAssertEqual(recorder.progressCount, 0)

    engine.setProgressObserved(true)
    run(for: 1.6)
    let observed = recorder.progressCount
    XCTAssertGreaterThanOrEqual(observed, 3, "about twice a second")
    XCTAssertLessThanOrEqual(observed, 6)

    engine.setProgressObserved(false)
    run(for: 1.0)
    XCTAssertEqual(recorder.progressCount, observed)
  }

  func testInterruptionPausesAndResumesWhenAllowed() {
    engine.setQueue([Tracks.long], play: true)
    waitForStatus(.playing)
    engine.handleSession(.interruptionBegan)
    waitForStatus(.paused)
    engine.handleSession(.interruptionEnded(shouldResume: true))
    waitForStatus(.playing)

    engine.handleSession(.interruptionBegan)
    waitForStatus(.paused)
    engine.handleSession(.interruptionEnded(shouldResume: false))
    run(for: 0.3)
    XCTAssertEqual(engine.status, .paused)
  }

  func testInterruptionResumesWhenThePlayerWasPausedBeforeTheNotification() {
    engine.setQueue([Tracks.long], play: true)
    waitForStatus(.playing)
    // iOS stops the player first, then posts the interruption.
    engine.player.pause()
    waitForStatus(.paused)
    run(for: 0.1)
    engine.handleSession(.interruptionBegan)
    engine.handleSession(.interruptionEnded(shouldResume: true))
    waitForStatus(.playing)
  }

  func testInterruptionDoesNotResumeWhatWasPaused() {
    engine.setQueue([Tracks.long], play: false)
    engine.handleSession(.interruptionBegan)
    engine.handleSession(.interruptionEnded(shouldResume: true))
    run(for: 0.3)
    XCTAssertEqual(engine.status, .paused)
  }

  func testLosingTheOutputPauses() {
    engine.setQueue([Tracks.long], play: true)
    waitForStatus(.playing)
    engine.handleSession(.outputLost)
    waitForStatus(.paused)
    XCTAssertEqual(recorder.states.last?.status, .paused, "state event sent")
    engine.toggle()
    waitForStatus(.playing)
  }

  func testPausedByTheSystemIsReflected() {
    engine.setQueue([Tracks.long], play: true)
    waitForStatus(.playing)
    // Something outside the engine pauses the player (as iOS does on a route change).
    engine.player.pause()
    waitForStatus(.paused)
    engine.toggle()
    waitForStatus(.playing)
  }

  func testMediaServicesResetRebuildsThePlayer() {
    engine.setQueue([Tracks.long, Tracks.b], play: true)
    waitUntil("past 1 s") { engine.positionMs > 1000 }
    let oldPlayer = engine.player
    engine.handleSession(.mediaServicesReset)
    XCTAssertFalse(engine.player === oldPlayer)
    waitUntil("reloaded, paused") { engine.status == .paused && engine.current?.item.status == .readyToPlay }
    XCTAssertGreaterThan(engine.positionMs, 900)
    engine.play()
    waitForStatus(.playing)
    XCTAssertEqual(upcomingIndex, 1)
  }
}
