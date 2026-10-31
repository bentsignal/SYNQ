import AVFoundation
import ExpoModulesCore

struct Mp4Tags: Record {
  @Field var title: String?
  @Field var artist: String?
  @Field var album: String?
  @Field var year: Int?
  @Field var track: Int?
}

/// Writes iTunes tags into a copy of an MPEG-4 audio file (m4a: AAC or
/// ALAC) by remuxing it with AVFoundation's passthrough export: the audio
/// isn't re-encoded, and tags it doesn't set are kept.
enum Mp4Tagger {
  enum TagError: Error, CustomStringConvertible {
    case unsupported
    case failed(String)

    var description: String {
      switch self {
      case .unsupported: return "This file can't be retagged."
      case .failed(let message): return message
      }
    }
  }

  private static let replaced: Set<AVMetadataIdentifier> = [
    .iTunesMetadataSongName, .iTunesMetadataArtist, .iTunesMetadataAlbum,
    .iTunesMetadataReleaseDate, .iTunesMetadataTrackNumber, .iTunesMetadataCoverArt,
  ]

  static func tag(source: URL, destination: URL, tags: Mp4Tags, artworkURL: URL?) async throws {
    let asset = AVURLAsset(url: source)
    let existing = try await asset.load(.metadata).filter { item in
      item.keySpace == .iTunes && !(item.identifier.map { replaced.contains($0) } ?? false)
    }
    var items = existing
    items += text(.iTunesMetadataSongName, tags.title)
    items += text(.iTunesMetadataArtist, tags.artist)
    items += text(.iTunesMetadataAlbum, tags.album)
    items += text(.iTunesMetadataReleaseDate, tags.year.map(String.init))
    if let artworkURL, let data = try? Data(contentsOf: artworkURL), !data.isEmpty {
      let item = AVMutableMetadataItem()
      item.identifier = .iTunesMetadataCoverArt
      item.value = data as NSData
      item.dataType = kCMMetadataBaseDataType_JPEG as String
      items.append(item)
    }
    let trackItem = tags.track.flatMap(trackNumber)
    do {
      try await export(asset: asset, to: destination, metadata: items + (trackItem.map { [$0] } ?? []))
    } catch {
      // The binary trkn atom is the one item AVFoundation is picky about;
      // the other tags are worth more than the track number.
      if trackItem == nil { throw error }
      try await export(asset: asset, to: destination, metadata: items)
    }
  }

  private static func text(_ identifier: AVMetadataIdentifier, _ value: String?) -> [AVMetadataItem] {
    guard let value, !value.isEmpty else { return [] }
    let item = AVMutableMetadataItem()
    item.identifier = identifier
    item.value = value as NSString
    item.extendedLanguageTag = "und"
    return [item]
  }

  /// trkn: 8 bytes, the track number as a big-endian UInt16 at offset 2.
  private static func trackNumber(_ track: Int) -> AVMetadataItem? {
    guard track > 0, track <= Int(UInt16.max) else { return nil }
    let item = AVMutableMetadataItem()
    item.identifier = .iTunesMetadataTrackNumber
    item.value = Data([0, 0, UInt8(track >> 8), UInt8(track & 0xff), 0, 0, 0, 0]) as NSData
    item.dataType = kCMMetadataBaseDataType_RawData as String
    return item
  }

  private static func export(asset: AVURLAsset, to destination: URL, metadata: [AVMetadataItem])
    async throws
  {
    guard
      let session = AVAssetExportSession(asset: asset, presetName: AVAssetExportPresetPassthrough)
    else { throw TagError.unsupported }
    let manager = FileManager.default
    try manager.createDirectory(
      at: destination.deletingLastPathComponent(), withIntermediateDirectories: true)
    if manager.fileExists(atPath: destination.path) { try manager.removeItem(at: destination) }
    session.metadata = metadata
    if #available(iOS 18, *) {
      try await session.export(to: destination, as: .m4a)
    } else {
      session.outputURL = destination
      session.outputFileType = .m4a
      await session.export()
      guard session.status == .completed else {
        throw TagError.failed(session.error?.localizedDescription ?? "Export failed.")
      }
    }
  }
}
