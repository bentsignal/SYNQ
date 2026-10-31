import AVFoundation
import XCTest

@testable import SynqAudioEngine

/// Queue edits and replacement while something plays.
final class QueueEditTests: EngineTestCase {
  private func playLong(_ tracks: [Track]) -> AVPlayerItem {
    engine.setQueue(tracks, play: true)
    waitForStatus(.playing)
    return engine.current!.item
  }

  func testInsertKeepsTheCurrentItemAndUpdatesThePreload() {
    let item = playLong([Tracks.long, Tracks.b])
    engine.insert([Tracks.c], at: 1)
    XCTAssertTrue(engine.current?.item === item)
    XCTAssertEqual(engine.tracks.map(\.id), ["long", "c", "b"])
    XCTAssertEqual(engine.currentIndex, 0)
    XCTAssertEqual(upcomingIndex, 1)
    XCTAssertEqual(engine.snapshot().trackId, "long")
    assertPlayerItemsMatchSlots()

    engine.insert([Tracks.a])
    XCTAssertEqual(engine.tracks.map(\.id), ["long", "c", "b", "a"])
    XCTAssertEqual(upcomingIndex, 1)
    XCTAssertEqual(engine.status, .playing)
  }

  func testInsertBeforeTheCurrentShiftsItsIndex() {
    let item = playLong([Tracks.long, Tracks.b])
    engine.insert([Tracks.a, Tracks.c], at: 0)
    XCTAssertTrue(engine.current?.item === item)
    XCTAssertEqual(engine.currentIndex, 2)
    XCTAssertTrue(recorder.events.contains(.queue(length: 4, index: 2)))
  }

  func testInsertIntoAnEmptyQueueLoadsPaused() {
    engine.insert([Tracks.a, Tracks.b])
    XCTAssertEqual(engine.currentIndex, 0)
    waitUntil("ready") { engine.current?.item.status == .readyToPlay }
    XCTAssertEqual(engine.status, .paused)
    engine.play()
    waitForStatus(.playing)
  }

  func testRemovingTheUpcomingEntryPreloadsTheOneAfter() {
    let item = playLong([Tracks.long, Tracks.b, Tracks.c])
    engine.remove([1])
    XCTAssertTrue(engine.current?.item === item)
    XCTAssertEqual(engine.tracks.map(\.id), ["long", "c"])
    XCTAssertEqual(upcomingIndex, 1)
    XCTAssertEqual(engine.upcoming?.track.id, "c")
    assertPlayerItemsMatchSlots()
    XCTAssertEqual(engine.status, .playing)
  }

  func testRemovingTheCurrentEntryPlaysTheOneThatTookItsPlace() {
    _ = playLong([Tracks.a, Tracks.long, Tracks.long2])
    engine.remove([0])
    XCTAssertEqual(engine.currentIndex, 0)
    XCTAssertEqual(engine.snapshot().trackId, "long")
    waitForStatus(.playing)
    XCTAssertEqual(upcomingIndex, 1)
  }

  func testRemovingTheLastPlayingEntryStopsOnTheNewLast() {
    engine.setQueue([Tracks.a, Tracks.long], startIndex: 1, play: true)
    waitForStatus(.playing)
    engine.remove([1])
    XCTAssertEqual(engine.snapshot().trackId, "a")
    waitUntil("paused on a") { engine.status == .paused }
  }

  func testRemovingEverythingGoesIdle() {
    _ = playLong([Tracks.long, Tracks.b])
    engine.remove([0, 1])
    XCTAssertEqual(engine.status, .idle)
    XCTAssertNil(engine.currentIndex)
    XCTAssertTrue(engine.player.items().isEmpty)
    XCTAssertEqual(recorder.nowPlaying.last.flatMap { $0 } == nil, true, "now playing cleared")
  }

  func testMoveKeepsTheCurrentItem() {
    let item = playLong([Tracks.long, Tracks.b, Tracks.c])
    engine.move(from: 2, to: 1)
    XCTAssertEqual(engine.tracks.map(\.id), ["long", "c", "b"])
    XCTAssertEqual(engine.upcoming?.track.id, "c")
    engine.move(from: 0, to: 2)
    XCTAssertEqual(engine.tracks.map(\.id), ["c", "b", "long"])
    XCTAssertEqual(engine.currentIndex, 2)
    XCTAssertTrue(engine.current?.item === item)
    XCTAssertNil(engine.upcoming, "last entry, repeat off")
    assertPlayerItemsMatchSlots()
    XCTAssertEqual(engine.status, .playing)
  }

  func testReplacingTheQueueKeepsTheSameTrackPlayingSeamlessly() {
    let item = playLong([Tracks.a, Tracks.long, Tracks.b, Tracks.c])
    engine.skip(to: 1)
    waitUntil("on long, past 300 ms") { engine.currentIndex == 1 && engine.status == .playing && engine.positionMs > 300 }
    let playing = engine.current!.item
    XCTAssertFalse(playing === item)
    let before = engine.positionMs

    // e.g. turning shuffle on: same track, new order around it.
    engine.setQueue([Tracks.c, Tracks.long, Tracks.a], startIndex: 1)
    XCTAssertTrue(engine.current?.item === playing, "same item")
    XCTAssertTrue(engine.player.currentItem === playing)
    XCTAssertEqual(engine.currentIndex, 1)
    XCTAssertEqual(engine.upcoming?.track.id, "a")
    XCTAssertGreaterThanOrEqual(engine.positionMs, before, "no seek back")
    XCTAssertEqual(engine.status, .playing)
    assertPlayerItemsMatchSlots()
  }

  func testReplacingTheQueueWhilePausedKeepsItPaused() {
    _ = playLong([Tracks.long, Tracks.b])
    engine.pause()
    waitForStatus(.paused)
    let item = engine.current!.item
    engine.setQueue([Tracks.b, Tracks.long], startIndex: 1)
    XCTAssertTrue(engine.current?.item === item)
    run(for: 0.2)
    XCTAssertEqual(engine.status, .paused)
  }

  func testReplacingWithADifferentTrackLoadsIt() {
    let item = playLong([Tracks.long, Tracks.b])
    engine.setQueue([Tracks.long2, Tracks.long], startIndex: 0)
    XCTAssertFalse(engine.current?.item === item)
    waitForStatus(.playing)
    XCTAssertEqual(engine.snapshot().trackId, "long2")
    XCTAssertLessThan(engine.positionMs, 1000)
  }

  func testDuplicateTracksAreDistinctEntries() {
    engine.setQueue([Tracks.a, Tracks.a], play: true)
    waitForStatus(.ended)
    XCTAssertEqual(recorder.states.filter { $0.status == .playing }.compactMap(\.index).reduce(into: [Int]()) {
      if $0.last != $1 { $0.append($1) }
    }, [0, 1])
  }
}
