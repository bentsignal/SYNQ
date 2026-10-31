import XCTest

@testable import SynqAudioEngine

/// Files that can't play report an error and playback moves on.
final class FailureTests: EngineTestCase {
  func testMissingFileReportsAnErrorAndAdvances() {
    engine.setQueue([Tracks.missing, Tracks.a], play: true)
    waitForStatus(.playing)
    XCTAssertEqual(engine.currentIndex, 1)
    XCTAssertEqual(engine.snapshot().trackId, "a")
    XCTAssertEqual(recorder.errors.map(\.code), [.fileMissing])
    XCTAssertEqual(recorder.errors.first?.trackId, "missing")
    XCTAssertEqual(recorder.errors.first?.index, 0)
  }

  func testMissingFileFoundWhilePreloadingIsSkipped() {
    engine.setQueue([Tracks.a, Tracks.missing, Tracks.b], play: true)
    waitForStatus(.playing)
    XCTAssertEqual(recorder.errors.map(\.trackId), ["missing"], "reported while a plays")
    XCTAssertEqual(upcomingIndex, 2)
    waitForStatus(.ended)
    XCTAssertEqual(recorder.playedTrackIds, ["a", "b"])
  }

  func testUndecodableFileReportsALoadFailureAndAdvances() {
    engine.setQueue([Tracks.corrupt, Tracks.a], play: true)
    waitUntil("on a") { engine.snapshot().trackId == "a" && engine.status == .playing }
    XCTAssertEqual(recorder.errors.first?.code, .loadFailed)
    XCTAssertEqual(recorder.errors.first?.trackId, "corrupt")
  }

  func testUndecodableFileFoundWhilePreloadingIsSkipped() {
    engine.setQueue([Tracks.a, Tracks.corrupt, Tracks.b], play: true)
    waitForStatus(.ended)
    XCTAssertEqual(recorder.playedTrackIds, ["a", "b"])
    XCTAssertEqual(recorder.errors.map(\.trackId), ["corrupt"])
  }

  func testNothingPlayableEndsInError() {
    engine.setQueue([Tracks.missing, Tracks.corrupt], play: true)
    waitForStatus(.error)
    XCTAssertEqual(Set(recorder.errors.compactMap(\.trackId)), ["missing", "corrupt"])
    XCTAssertTrue(engine.player.items().isEmpty)
  }

  func testRepeatAllDoesNotSpinOnFailures() {
    engine.setRepeatMode(.all)
    engine.setQueue([Tracks.a, Tracks.missing], play: true)
    waitUntil("a again", timeout: 8) { recorder.playedTrackIds.count >= 1 && engine.status == .playing && engine.positionMs > 0 }
    run(for: 1.5)
    XCTAssertEqual(recorder.errors.count, 1, "the missing entry is reported once")
    XCTAssertEqual(engine.snapshot().trackId, "a")
  }

  func testSkippingToAFailedEntryRetriesIt() {
    engine.setQueue([Tracks.missing, Tracks.long], play: true)
    waitForStatus(.playing)
    XCTAssertTrue(engine.skip(to: 0))
    XCTAssertEqual(recorder.errors.count, 2, "tried again")
    waitForStatus(.playing)
    XCTAssertEqual(engine.snapshot().trackId, "long")
  }
}
