import XCTest

@testable import SynqAudioEngine

/// The free tier's ad: counted natively, inserted at the next transition.
final class InterstitialTests: EngineTestCase {
  private func configure(afterMs: Double, listenedMs: Double = 0) {
    engine.configureInterstitial(InterstitialConfig(track: Tracks.ad, afterListeningMs: afterMs, listenedMs: listenedMs))
  }

  private func waitForInterstitial(file: StaticString = #filePath, line: UInt = #line) {
    waitUntil("interstitial", file: file, line: line) { engine.isInterstitialActive && engine.status == .playing }
  }

  func testPlaysAtTheNextTrackEndOncePastTheThreshold() {
    configure(afterMs: 300)
    engine.setQueue([Tracks.a, Tracks.b], play: true)
    waitForStatus(.playing)
    XCTAssertEqual(upcomingIndex, 1, "not due yet")

    waitUntil("due") { engine.isInterstitialDue }
    waitUntil("preloaded") { engine.upcoming?.content == .interstitial }
    assertPlayerItemsMatchSlots()

    waitForInterstitial()
    XCTAssertEqual(recorder.count(.interstitialStart), 1)
    let state = engine.snapshot()
    XCTAssertTrue(state.interstitial)
    XCTAssertEqual(state.trackId, "ad")
    XCTAssertEqual(state.index, 1, "the entry that plays after it")
    XCTAssertEqual(upcomingIndex, 1, "b preloaded after the interstitial")
    XCTAssertFalse(engine.skipAndSeekEnabled)

    waitUntil("b after the interstitial") { engine.snapshot().trackId == "b" && engine.status == .playing }
    XCTAssertEqual(recorder.count(.interstitialEnd), 1)
    XCTAssertFalse(engine.isInterstitialActive)
    XCTAssertTrue(engine.skipAndSeekEnabled)
    XCTAssertLessThan(engine.listenedMs, 300, "counter reset")
    XCTAssertEqual(engine.currentIndex, 1)
    XCTAssertEqual(recorder.playedTrackIds, ["a", "ad", "b"])
  }

  func testSkippingAndSeekingAreBlockedButPauseWorks() {
    configure(afterMs: 0)
    engine.setQueue([Tracks.a, Tracks.b], play: true)
    waitForInterstitial()
    XCTAssertFalse(engine.next())
    XCTAssertFalse(engine.previous())
    XCTAssertFalse(engine.skip(to: 1))
    XCTAssertFalse(engine.seek(toMs: 500))
    XCTAssertTrue(engine.isInterstitialActive)

    engine.pause()
    waitForStatus(.paused)
    run(for: 1.0)
    XCTAssertTrue(engine.isInterstitialActive, "paused, not skipped")
    engine.play()
    waitUntil("a after it") { engine.snapshot().trackId == "a" && engine.status == .playing }
  }

  func testANewQueuePlaysItFirst() {
    configure(afterMs: 500, listenedMs: 600)
    engine.setQueue([Tracks.long, Tracks.b], play: true)
    waitForInterstitial()
    XCTAssertEqual(engine.currentIndex, 0)
    waitUntil("long after it") { engine.snapshot().trackId == "long" && engine.status == .playing }
    XCTAssertEqual(engine.currentIndex, 0)
  }

  func testNextPlaysItThenTheRequestedTrack() {
    engine.setQueue([Tracks.long, Tracks.long2, Tracks.b], play: true)
    waitForStatus(.playing)
    configure(afterMs: 100)
    waitUntil("due") { engine.isInterstitialDue }
    XCTAssertTrue(engine.skip(to: 2))
    waitForInterstitial()
    XCTAssertEqual(engine.currentIndex, 2)
    waitUntil("b after it") { engine.snapshot().trackId == "b" && engine.status == .playing }
  }

  func testPreviousRestartingTheTrackIsNotATransition() {
    configure(afterMs: 100)
    engine.setQueue([Tracks.long, Tracks.long2], startIndex: 1, positionMs: 3200, play: true)
    waitUntil("due, past 3 s") { engine.isInterstitialDue && engine.status == .playing && engine.positionMs > 3300 }
    XCTAssertFalse(engine.isInterstitialActive)
    XCTAssertTrue(engine.previous(), "restart")
    run(for: 0.2)
    XCTAssertFalse(engine.isInterstitialActive)
    XCTAssertEqual(engine.snapshot().trackId, "long2")
  }

  func testResumesAtTheRequestedPositionAfterIt() {
    configure(afterMs: 0)
    engine.setQueue([Tracks.long], positionMs: 2000, play: true)
    waitForInterstitial()
    XCTAssertNil(engine.upcoming, "a positioned resume isn't preloaded")
    waitUntil("long at 2 s") { engine.snapshot().trackId == "long" && engine.status == .playing }
    XCTAssertGreaterThanOrEqual(engine.positionMs, 2000)
  }

  func testRestoringPausedDoesNotPlayIt() {
    configure(afterMs: 100, listenedMs: 5000)
    engine.setQueue([Tracks.long, Tracks.b], positionMs: 1000, play: false)
    XCTAssertFalse(engine.isInterstitialActive)
    engine.play()
    waitForStatus(.playing)
    XCTAssertEqual(engine.snapshot().trackId, "long")
    XCTAssertGreaterThanOrEqual(engine.positionMs, 1000)
    XCTAssertEqual(engine.upcoming?.content, .interstitial, "it comes at the next transition")
  }

  func testANewQueueDuringItChangesWhatFollows() {
    configure(afterMs: 0)
    engine.setQueue([Tracks.a, Tracks.b], play: true)
    waitForInterstitial()
    engine.setQueue([Tracks.c, Tracks.long], startIndex: 1)
    XCTAssertTrue(engine.isInterstitialActive, "keeps playing")
    XCTAssertEqual(engine.currentIndex, 1)
    XCTAssertEqual(engine.upcoming?.track.id, "long")
    waitUntil("long after it") { engine.snapshot().trackId == "long" && engine.status == .playing }
  }

  func testRemovingWhatFollowsItDuringItPicksTheNextEntry() {
    configure(afterMs: 0)
    engine.setQueue([Tracks.a, Tracks.b, Tracks.c], play: true)
    waitForInterstitial()
    engine.remove([0])
    XCTAssertEqual(engine.currentIndex, 0)
    XCTAssertEqual(engine.upcoming?.track.id, "b")
    waitUntil("b after it") { engine.snapshot().trackId == "b" && engine.status == .playing }
  }

  func testClearingTheConfigurationDuringItStopsIt() {
    configure(afterMs: 0)
    engine.setQueue([Tracks.long, Tracks.b], play: true)
    waitForInterstitial()
    engine.configureInterstitial(nil)
    XCTAssertFalse(engine.isInterstitialActive)
    XCTAssertEqual(recorder.count(.interstitialEnd), 1)
    XCTAssertTrue(engine.skipAndSeekEnabled)
    waitForStatus(.playing)
    XCTAssertEqual(engine.snapshot().trackId, "long")
    XCTAssertEqual(engine.listenedMs, 0)
  }

  func testCountsListeningTimeOnlyWhilePlaying() {
    configure(afterMs: 60_000, listenedMs: 1000)
    engine.setQueue([Tracks.long], play: false)
    run(for: 0.4)
    XCTAssertEqual(engine.listenedMs, 1000)
    XCTAssertEqual(engine.snapshot().listenedMs, 1000)

    engine.play()
    waitForStatus(.playing)
    run(for: 0.6)
    engine.pause()
    waitForStatus(.paused)
    let listened = engine.listenedMs
    XCTAssertEqual(listened, 1600, accuracy: 250)
    run(for: 0.4)
    XCTAssertEqual(engine.listenedMs, listened, "paused time isn't counted")

    // Reconfiguring without a count keeps native's; the app restores a
    // persisted count by passing it.
    engine.configureInterstitial(InterstitialConfig(track: Tracks.ad, afterListeningMs: 60_000))
    XCTAssertEqual(engine.listenedMs, listened)
    configure(afterMs: 60_000, listenedMs: 42)
    XCTAssertEqual(engine.listenedMs, 42)
  }

  func testDoesNotCountTheInterstitialItself() {
    configure(afterMs: 0)
    engine.setQueue([Tracks.a], play: true)
    waitForInterstitial()
    run(for: 0.5)
    XCTAssertEqual(engine.listenedMs, 0)
  }

  func testNotPlayedAtTheEndOfTheQueue() {
    configure(afterMs: 100)
    engine.setQueue([Tracks.a], play: true)
    waitForStatus(.ended)
    XCTAssertFalse(recorder.events.contains(.interstitialStart))
    XCTAssertTrue(engine.isInterstitialDue, "still due for the next transition")
  }

  func testAMissingInterstitialFileDoesNotBlockPlayback() {
    engine.configureInterstitial(InterstitialConfig(track: Tracks.missing, afterListeningMs: 0, listenedMs: 0))
    engine.setQueue([Tracks.a, Tracks.b], play: true)
    waitForStatus(.ended)
    XCTAssertEqual(recorder.playedTrackIds, ["a", "b"])
    XCTAssertTrue(recorder.errors.contains { $0.code == .interstitialFailed })
  }
}
