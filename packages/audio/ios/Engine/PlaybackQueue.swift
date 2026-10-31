import Foundation

/// Identifies one entry of the queue. A track can appear in the queue more than
/// once, so items are matched by entry key, never by track id.
typealias EntryKey = UInt64

struct QueueEntry: Equatable {
  let key: EntryKey
  var track: Track
}

/// The logical queue: an ordered list of entries with stable keys. Pure value
/// type with no AVFoundation, so navigation rules are easy to test.
struct PlaybackQueue {
  private(set) var entries: [QueueEntry] = []
  private var positions: [EntryKey: Int] = [:]
  private var lastKey: EntryKey = 0

  enum Direction {
    /// The current entry finished on its own.
    case natural
    /// The user asked for the next entry.
    case next
    /// The user asked for the previous entry.
    case previous
  }

  var count: Int { entries.count }
  var isEmpty: Bool { entries.isEmpty }
  var tracks: [Track] { entries.map(\.track) }

  func index(of key: EntryKey) -> Int? { positions[key] }

  func entry(at index: Int) -> QueueEntry? {
    entries.indices.contains(index) ? entries[index] : nil
  }

  func entry(for key: EntryKey) -> QueueEntry? {
    positions[key].map { entries[$0] }
  }

  func contains(_ key: EntryKey) -> Bool { positions[key] != nil }

  /// Replaces every entry. When `reusing` is given, the entry at `index` takes
  /// that key, so an item already playing for it stays matched.
  mutating func replace(with tracks: [Track], reusing key: EntryKey? = nil, at index: Int = 0) {
    entries = tracks.enumerated().map { offset, track in
      if let key, offset == index {
        return QueueEntry(key: key, track: track)
      }
      return QueueEntry(key: makeKey(), track: track)
    }
    reindex()
  }

  /// Inserts tracks before `index` (clamped to the queue bounds). Returns the
  /// index of the first inserted entry.
  @discardableResult
  mutating func insert(_ tracks: [Track], at index: Int) -> Int {
    let at = min(max(index, 0), entries.count)
    entries.insert(contentsOf: tracks.map { QueueEntry(key: makeKey(), track: $0) }, at: at)
    reindex()
    return at
  }

  /// Removes the entries at `indices`; out-of-range indices are ignored.
  /// Returns the removed keys.
  @discardableResult
  mutating func remove(_ indices: Set<Int>) -> Set<EntryKey> {
    var removed = Set<EntryKey>()
    var kept: [QueueEntry] = []
    kept.reserveCapacity(entries.count)
    for (offset, entry) in entries.enumerated() {
      if indices.contains(offset) {
        removed.insert(entry.key)
      } else {
        kept.append(entry)
      }
    }
    guard !removed.isEmpty else { return removed }
    entries = kept
    reindex()
    return removed
  }

  /// Moves the entry at `from` so it ends up at `to`. Returns false when either
  /// index is out of range or they are equal.
  @discardableResult
  mutating func move(from: Int, to: Int) -> Bool {
    guard entries.indices.contains(from), entries.indices.contains(to), from != to else { return false }
    let entry = entries.remove(at: from)
    entries.insert(entry, at: to)
    reindex()
    return true
  }

  /// The entry to go to from `key` in `direction`, skipping entries for which
  /// `isPlayable` is false. Nil when there is none.
  func neighbor(
    of key: EntryKey,
    direction: Direction,
    repeatMode: RepeatMode,
    isPlayable: (QueueEntry) -> Bool = { _ in true }
  ) -> EntryKey? {
    guard let position = positions[key] else { return nil }
    switch direction {
    case .previous:
      var index = position - 1
      while index >= 0 {
        if isPlayable(entries[index]) { return entries[index].key }
        index -= 1
      }
      return nil
    case .natural, .next:
      if direction == .natural, repeatMode == .one, isPlayable(entries[position]) {
        return key
      }
      let wraps = repeatMode != .off
      var index = position
      for _ in 0..<entries.count {
        index += 1
        if index == entries.count {
          guard wraps else { return nil }
          index = 0
        }
        if isPlayable(entries[index]) { return entries[index].key }
      }
      return nil
    }
  }

  private mutating func makeKey() -> EntryKey {
    lastKey += 1
    return lastKey
  }

  private mutating func reindex() {
    positions.removeAll(keepingCapacity: true)
    for (offset, entry) in entries.enumerated() {
      positions[entry.key] = offset
    }
  }
}
