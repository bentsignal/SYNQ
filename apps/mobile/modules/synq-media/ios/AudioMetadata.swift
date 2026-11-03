import AVFoundation

/// Reads an audio file's duration and tags with AVFoundation, which parses
/// ID3 (mp3, wav), iTunes atoms (m4a, aac in mp4), and QuickTime metadata.
/// FLAC's Vorbis comments aren't exposed by AVFoundation; JavaScript reads
/// those itself (`flac-tags.ts`).
enum AudioMetadataReader {
  enum ReadError: Error, CustomStringConvertible {
    case unplayable

    var description: String { "The file isn't playable audio." }
  }

  private static let titleIds: [AVMetadataIdentifier] = [
    .commonIdentifierTitle, .id3MetadataTitleDescription, .iTunesMetadataSongName,
    .quickTimeMetadataTitle,
  ]
  private static let artistIds: [AVMetadataIdentifier] = [
    .commonIdentifierArtist, .id3MetadataLeadPerformer, .iTunesMetadataArtist,
    .quickTimeMetadataArtist,
  ]
  private static let albumIds: [AVMetadataIdentifier] = [
    .commonIdentifierAlbumName, .id3MetadataAlbumTitle, .iTunesMetadataAlbum,
    .quickTimeMetadataAlbum,
  ]
  private static let yearIds: [AVMetadataIdentifier] = [
    .id3MetadataRecordingTime, .id3MetadataYear, .iTunesMetadataReleaseDate,
    .quickTimeMetadataYear, .commonIdentifierCreationDate,
  ]
  private static let artworkIds: [AVMetadataIdentifier] = [
    .commonIdentifierArtwork, .id3MetadataAttachedPicture, .iTunesMetadataCoverArt,
    .quickTimeMetadataArtwork,
  ]

  /// The duration in milliseconds and the raw tag strings (JavaScript cleans
  /// them). Embedded artwork, if any, is written as-is to `artworkURL`.
  static func read(fileURL: URL, artworkURL: URL) async throws -> [String: Any] {
    let asset = AVURLAsset(
      url: fileURL, options: [AVURLAssetPreferPreciseDurationAndTimingKey: true])
    let (duration, playable, common, all) = try await asset.load(
      .duration, .isPlayable, .commonMetadata, .metadata)
    guard playable else { throw ReadError.unplayable }
    let items = common + all

    var result: [String: Any] = [:]
    let seconds = CMTimeGetSeconds(duration)
    result["durationMs"] = seconds.isFinite && seconds > 0 ? Int((seconds * 1000).rounded()) : 0
    result["title"] = await firstString(items, titleIds)
    result["artist"] = await firstString(items, artistIds)
    result["album"] = await firstString(items, albumIds)
    result["year"] = await firstString(items, yearIds)
    result["track"] = await track(items)

    var hasArtwork = false
    if let data = await firstData(items, artworkIds), !data.isEmpty {
      try FileManager.default.createDirectory(
        at: artworkURL.deletingLastPathComponent(), withIntermediateDirectories: true)
      try data.write(to: artworkURL, options: .atomic)
      hasArtwork = true
    }
    result["hasArtwork"] = hasArtwork
    return result
  }

  private static func matching(
    _ items: [AVMetadataItem], _ ids: [AVMetadataIdentifier]
  ) -> [AVMetadataItem] {
    ids.flatMap { id in items.filter { $0.identifier == id } }
  }

  private static func firstString(
    _ items: [AVMetadataItem], _ ids: [AVMetadataIdentifier]
  ) async -> String? {
    for item in matching(items, ids) {
      if let value = try? await item.load(.stringValue),
        !value.trimmingCharacters(in: .whitespacesAndNewlines).isEmpty
      {
        return value
      }
    }
    return nil
  }

  private static func firstData(
    _ items: [AVMetadataItem], _ ids: [AVMetadataIdentifier]
  ) async -> Data? {
    for item in matching(items, ids) {
      if let data = try? await item.load(.dataValue), !data.isEmpty { return data }
    }
    return nil
  }

  /// ID3's TRCK is text ("3" or "3/12"); iTunes' trkn is binary (the track
  /// number is the big-endian UInt16 at bytes 2–3).
  private static func track(_ items: [AVMetadataItem]) async -> String? {
    if let text = await firstString(items, [.id3MetadataTrackNumber]) { return text }
    for item in matching(items, [.iTunesMetadataTrackNumber]) {
      if let data = try? await item.load(.dataValue), data.count >= 4 {
        let bytes = [UInt8](data)
        let number = Int(bytes[2]) << 8 | Int(bytes[3])
        if number > 0 { return String(number) }
      }
      if let number = try? await item.load(.numberValue), number.intValue > 0 {
        return number.stringValue
      }
    }
    return nil
  }
}
