import Foundation

/// File operations JavaScript can't do without pulling whole files through
/// the JS thread.
enum Files {
  /// Writes `head` to `destination`, then `source` from byte `skip` to the
  /// end, streamed in 1 MB chunks. Retagging replaces a file's tag block
  /// (ID3, FLAC metadata) this way without reading the audio into memory.
  static func splice(source: URL, destination: URL, skip: Int, head: Data) throws {
    let manager = FileManager.default
    try manager.createDirectory(
      at: destination.deletingLastPathComponent(), withIntermediateDirectories: true)
    if manager.fileExists(atPath: destination.path) { try manager.removeItem(at: destination) }
    guard manager.createFile(atPath: destination.path, contents: nil) else {
      throw CocoaError(.fileWriteUnknown)
    }
    let input = try FileHandle(forReadingFrom: source)
    defer { try? input.close() }
    let output = try FileHandle(forWritingTo: destination)
    defer { try? output.close() }
    try output.write(contentsOf: head)
    try input.seek(toOffset: UInt64(max(0, skip)))
    while true {
      let done = try autoreleasepool { () -> Bool in
        guard let chunk = try input.read(upToCount: 1 << 20), !chunk.isEmpty else { return true }
        try output.write(contentsOf: chunk)
        return false
      }
      if done { break }
    }
    try output.synchronize()
  }

  /// Mirrors the tree at `from` into `to` with hard links (no extra space;
  /// both are in the app's container), falling back to copies. Backups stage
  /// the library this way before zipping it.
  static func linkTree(from: URL, to: URL) throws {
    let manager = FileManager.default
    try manager.createDirectory(at: to, withIntermediateDirectories: true)
    guard
      let enumerator = manager.enumerator(
        at: from, includingPropertiesForKeys: [.isDirectoryKey], options: [])
    else { return }
    let base = from.standardizedFileURL.path
    for case let url as URL in enumerator {
      let path = url.standardizedFileURL.path
      guard path.hasPrefix(base) else { continue }
      let relative = String(path.dropFirst(base.count)).trimmingCharacters(
        in: CharacterSet(charactersIn: "/"))
      let target = to.appendingPathComponent(relative)
      let isDirectory = (try? url.resourceValues(forKeys: [.isDirectoryKey]))?.isDirectory ?? false
      if isDirectory {
        try manager.createDirectory(at: target, withIntermediateDirectories: true)
      } else {
        do {
          try manager.linkItem(at: url, to: target)
        } catch {
          try manager.copyItem(at: url, to: target)
        }
      }
    }
  }
}
