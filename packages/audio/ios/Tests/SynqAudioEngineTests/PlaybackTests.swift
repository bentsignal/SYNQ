import AVFoundation
import XCTest

@testable import SynqAudioEngine

/// Plays real (silent) files through AVQueuePlayer.
final class PlaybackTests: EngineTestCase {
  func testAutoAdvancesThroughTheQueueAndEnds() {
    engine.setQueue([Tracks.a, Tracks.b, Tracks.c], play: true)
    waitForStatus(.ended)
    XCTAssertEqual(recorder.playedTrackIds, ["a", "b", "c"])
    let state = engine.snapshot()
    XCTAssertEqual(state.index, 2)
    XCTAssertEqual(state.trackId, "c")
    XCTAssertGreaterThan(state.positionMs, 900)
    XCTAssertNil(engine.upcoming)
  }

  func testPreloadsTheNextItemAndAdvancesIntoIt() {
    engine.setQueue([Tracks.a, Tracks.b, Tracks.c], play: true)
    waitForStatus(.playing)

    // The next item is in the player while the current one still plays.
    XCTAssertEqual(upcomingIndex, 1)
    assertPlayerItemsMatchSlots()
    let preloaded = engine.upcoming!.item
    XCTAssertLessThan(engine.positionMs, 900)

    waitUntil("advance to b") { engine.currentIndex == 1 && engine.status == .playing }
    // The very item that was preloaded is playing: nothing was reloaded.
    XCTAssertTrue(engine.current?.item === preloaded)
    XCTAssertTrue(engine.player.currentItem === preloaded)
    XCTAssertEqual(upcomingIndex, 2)
    assertPlayerItemsMatchSlots()
  }

  func testAdvancesWithoutGoingThroughPause() {
    engine.setQueue([Tracks.a, Tracks.b], play: true)
    waitForStatus(.playing)
    waitForStatus(.ended)
    let statuses = recorder.states.map(\.status)
    let firstPlaying = statuses.firstIndex(of: .playing)!
    let tail = statuses[firstPlaying...].filter { $0 != .playing && $0 != .loading }
    XCTAssertEqual(Array(tail), [.ended], "no pause between tracks: \(statuses)")
  }

  func testRepeatAllWrapsAround() {
    engine.setRepeatMode(.all)
    engine.setQueue([Tracks.a, Tracks.b], play: true)
    waitUntil("wrap back to a", timeout: 8) { recorder.playedTrackIds.count >= 3 }
    XCTAssertEqual(Array(recorder.playedTrackIds.prefix(3)), ["a", "b", "a"])
    XCTAssertEqual(engine.status, .playing)
  }

  func testRepeatOneRepeatsTheTrackGaplessly() {
    engine.setRepeatMode(.one)
    engine.setQueue([Tracks.a, Tracks.b], play: true)
    waitForStatus(.playing)
    let first = engine.current!.item
    XCTAssertEqual(engine.upcoming?.content, engine.current?.content, "same entry preloaded again")
    XCTAssertFalse(engine.upcoming!.item === first, "as a new item")

    waitUntil("repeat") { engine.current?.item !== first && engine.status == .playing }
    XCTAssertEqual(engine.currentIndex, 0)
    XCTAssertEqual(engine.snapshot().trackId, "a")
  }

  func testChangingRepeatModeUpdatesThePreload() {
    engine.setQueue([Tracks.a, Tracks.b], play: true)
    waitForStatus(.playing)
    XCTAssertEqual(upcomingIndex, 1)
    engine.setRepeatMode(.one)
    XCTAssertEqual(upcomingIndex, 0)
    engine.skip(to: 1)
    waitUntil("on b") { engine.currentIndex == 1 }
    engine.setRepeatMode(.off)
    XCTAssertNil(engine.upcoming)
    engine.setRepeatMode(.all)
    XCTAssertEqual(upcomingIndex, 0)
    assertPlayerItemsMatchSlots()
  }

  func testNextStopsAtTheEndUnlessRepeating() {
    engine.setQueue([Tracks.long, Tracks.long2], play: true)
    XCTAssertTrue(engine.next())
    XCTAssertEqual(engine.currentIndex, 1)
    XCTAssertFalse(engine.next())
    engine.setRepeatMode(.all)
    XCTAssertTrue(engine.next())
    XCTAssertEqual(engine.currentIndex, 0)
    waitForStatus(.playing)
  }

  func testNextUsesThePreloadedItem() {
    engine.setQueue([Tracks.long, Tracks.long2], play: true)
    waitForStatus(.playing)
    let preloaded = engine.upcoming!.item
    XCTAssertTrue(engine.next())
    XCTAssertTrue(engine.current?.item === preloaded)
    XCTAssertTrue(engine.player.currentItem === preloaded)
    waitForStatus(.playing)
  }

  func testPreviousRestartsAfterThreeSecondsElseGoesBack() {
    engine.setQueue([Tracks.long, Tracks.long2], startIndex: 1, positionMs: 3500, play: true)
    waitUntil("playing past 3 s") { engine.status == .playing && engine.positionMs >= 3500 }

    XCTAssertTrue(engine.previous())
    XCTAssertEqual(engine.currentIndex, 1, "restarted, same track")
    waitUntil("back at the start") { engine.positionMs < 1000 && engine.status == .playing }

    XCTAssertTrue(engine.previous())
    XCTAssertEqual(engine.currentIndex, 0, "went back")
    waitForStatus(.playing)
  }

  func testPreviousOnTheFirstTrackRestartsIt() {
    engine.setQueue([Tracks.long, Tracks.long2], positionMs: 1500, play: true)
    waitUntil("playing") { engine.status == .playing }
    XCTAssertTrue(engine.previous())
    XCTAssertEqual(engine.currentIndex, 0)
    waitUntil("restarted") { engine.positionMs < 1000 }
  }

  func testSkipTo() {
    engine.setQueue([Tracks.a, Tracks.b, Tracks.long], play: false)
    XCTAssertTrue(engine.skip(to: 2))
    XCTAssertFalse(engine.skip(to: 3))
    waitForStatus(.playing)
    XCTAssertEqual(engine.snapshot().trackId, "long")
  }

  func testStartsAtTheRequestedPosition() {
    engine.setQueue([Tracks.long], positionMs: 2500, play: true)
    XCTAssertEqual(engine.positionMs, 2500, "reports the target before the item is ready")
    waitForStatus(.playing)
    XCTAssertGreaterThanOrEqual(engine.positionMs, 2500)
    XCTAssertLessThan(engine.positionMs, 3500)
  }

  func testRestoresPausedAtAPosition() {
    engine.setQueue([Tracks.long, Tracks.b], startIndex: 0, positionMs: 4000, play: false)
    waitUntil("ready") { engine.current?.item.status == .readyToPlay }
    run(for: 0.3)
    XCTAssertEqual(engine.status, .paused)
    XCTAssertEqual(engine.positionMs, 4000, accuracy: 50)
    engine.play()
    waitForStatus(.playing)
    XCTAssertGreaterThanOrEqual(engine.positionMs, 4000)
  }

  func testPauseToggleAndSeek() {
    engine.setQueue([Tracks.long], play: true)
    waitForStatus(.playing)
    engine.pause()
    waitForStatus(.paused)
    XCTAssertTrue(engine.seek(toMs: 3000))
    waitUntil("seeked") { abs(engine.positionMs - 3000) < 30 && engine.seekingToMs == nil }
    engine.toggle()
    waitForStatus(.playing)
    XCTAssertGreaterThanOrEqual(engine.positionMs, 3000)
    engine.toggle()
    waitForStatus(.paused)
  }

  func testPlayAfterTheQueueEndedRestartsTheLastTrack() {
    engine.setQueue([Tracks.a], play: true)
    waitForStatus(.ended)
    engine.play()
    waitForStatus(.playing)
    XCTAssertEqual(engine.currentIndex, 0)
    XCTAssertLessThan(engine.positionMs, 900)
  }

  func testStateEventsCarryIndexAndTrack() {
    engine.setQueue([Tracks.a, Tracks.b], play: true)
    waitForStatus(.ended)
    let playing = recorder.states.filter { $0.status == .playing }
    XCTAssertEqual(playing.first?.index, 0)
    XCTAssertEqual(playing.last?.index, 1)
    XCTAssertEqual(playing.last?.trackId, "b")
    XCTAssertTrue(recorder.events.contains(.queue(length: 2, index: 0)))
  }
}
