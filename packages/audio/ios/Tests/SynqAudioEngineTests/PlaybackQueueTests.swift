import XCTest

@testable import SynqAudioEngine

final class PlaybackQueueTests: XCTestCase {
  private func makeQueue(_ ids: [String]) -> PlaybackQueue {
    var queue = PlaybackQueue()
    queue.replace(with: ids.map { track($0, URL(fileURLWithPath: "/tmp/\($0).m4a")) })
    return queue
  }

  private func ids(_ queue: PlaybackQueue) -> [String] { queue.tracks.map(\.id) }

  private func id(_ queue: PlaybackQueue, _ key: EntryKey?) -> String? {
    key.flatMap { queue.entry(for: $0)?.track.id }
  }

  func testNaturalAdvanceFollowsRepeatMode() {
    let queue = makeQueue(["a", "b", "c"])
    let first = queue.entry(at: 0)!.key
    let last = queue.entry(at: 2)!.key
    XCTAssertEqual(id(queue, queue.neighbor(of: first, direction: .natural, repeatMode: .off)), "b")
    XCTAssertNil(queue.neighbor(of: last, direction: .natural, repeatMode: .off))
    XCTAssertEqual(id(queue, queue.neighbor(of: last, direction: .natural, repeatMode: .all)), "a")
    XCTAssertEqual(queue.neighbor(of: last, direction: .natural, repeatMode: .one), last)
  }

  func testExplicitNextWrapsWhenRepeatIsOnAndIgnoresRepeatOne() {
    let queue = makeQueue(["a", "b"])
    let first = queue.entry(at: 0)!.key
    let last = queue.entry(at: 1)!.key
    XCTAssertEqual(id(queue, queue.neighbor(of: first, direction: .next, repeatMode: .one)), "b")
    XCTAssertNil(queue.neighbor(of: last, direction: .next, repeatMode: .off))
    XCTAssertEqual(id(queue, queue.neighbor(of: last, direction: .next, repeatMode: .all)), "a")
    XCTAssertEqual(id(queue, queue.neighbor(of: last, direction: .next, repeatMode: .one)), "a")
  }

  func testPreviousNeverWraps() {
    let queue = makeQueue(["a", "b"])
    XCTAssertNil(queue.neighbor(of: queue.entry(at: 0)!.key, direction: .previous, repeatMode: .all))
    XCTAssertEqual(id(queue, queue.neighbor(of: queue.entry(at: 1)!.key, direction: .previous, repeatMode: .off)), "a")
  }

  func testNeighborSkipsUnplayableEntries() {
    let queue = makeQueue(["a", "x", "y", "b"])
    let bad: Set<String> = ["x", "y"]
    let playable: (QueueEntry) -> Bool = { !bad.contains($0.track.id) }
    let first = queue.entry(at: 0)!.key
    let last = queue.entry(at: 3)!.key
    XCTAssertEqual(id(queue, queue.neighbor(of: first, direction: .natural, repeatMode: .off, isPlayable: playable)), "b")
    XCTAssertEqual(id(queue, queue.neighbor(of: last, direction: .previous, repeatMode: .off, isPlayable: playable)), "a")
    // Nothing else playable: wraps around to itself with repeat all.
    let lonely = makeQueue(["a", "x"])
    let a = lonely.entry(at: 0)!.key
    XCTAssertEqual(lonely.neighbor(of: a, direction: .natural, repeatMode: .all, isPlayable: playable), a)
    XCTAssertNil(lonely.neighbor(of: a, direction: .natural, repeatMode: .off, isPlayable: playable))
  }

  func testRepeatOneSkipsItselfWhenUnplayable() {
    let queue = makeQueue(["a", "b"])
    let a = queue.entry(at: 0)!.key
    let next = queue.neighbor(of: a, direction: .natural, repeatMode: .one, isPlayable: { $0.key != a })
    XCTAssertEqual(id(queue, next), "b")
  }

  func testDuplicateTracksGetDistinctKeys() {
    let queue = makeQueue(["a", "a", "a"])
    XCTAssertEqual(Set(queue.entries.map(\.key)).count, 3)
    XCTAssertEqual(queue.neighbor(of: queue.entry(at: 0)!.key, direction: .natural, repeatMode: .off), queue.entry(at: 1)!.key)
  }

  func testEditsKeepKeys() {
    var queue = makeQueue(["a", "b", "c"])
    let b = queue.entry(at: 1)!.key
    XCTAssertEqual(queue.insert([track("x", URL(fileURLWithPath: "/tmp/x"))], at: 1), 1)
    XCTAssertEqual(ids(queue), ["a", "x", "b", "c"])
    XCTAssertEqual(queue.index(of: b), 2)

    XCTAssertTrue(queue.move(from: 2, to: 0))
    XCTAssertEqual(ids(queue), ["b", "a", "x", "c"])
    XCTAssertEqual(queue.index(of: b), 0)
    XCTAssertFalse(queue.move(from: 0, to: 9))

    let removed = queue.remove([1, 3, 42])
    XCTAssertEqual(removed.count, 2)
    XCTAssertEqual(ids(queue), ["b", "x"])
    XCTAssertEqual(queue.index(of: b), 0)

    XCTAssertEqual(queue.insert([track("z", URL(fileURLWithPath: "/tmp/z"))], at: 99), 2)
    XCTAssertEqual(ids(queue), ["b", "x", "z"])
  }

  func testReplaceCanReuseAKey() {
    var queue = makeQueue(["a", "b"])
    let b = queue.entry(at: 1)!.key
    queue.replace(with: ["c", "b", "a"].map { track($0, URL(fileURLWithPath: "/tmp/\($0)")) }, reusing: b, at: 1)
    XCTAssertEqual(queue.entry(at: 1)?.key, b)
    XCTAssertEqual(queue.index(of: b), 1)
    XCTAssertNotEqual(queue.entry(at: 0)?.key, queue.entry(at: 2)?.key)
  }
}
