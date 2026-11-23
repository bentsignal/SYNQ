import AVFoundation

/// Writes a video's sound to an M4A file. One AAC or ALAC track is copied
/// as it is (passthrough); anything else (several tracks, as a screen
/// recording with the microphone has, or another codec) is mixed and
/// encoded to AAC.
enum AudioExtractor {
  enum ExtractError: Error, CustomStringConvertible {
    case noAudio
    case unsupported
    case failed(String)

    var description: String {
      switch self {
      case .noAudio: return "This video has no sound."
      case .unsupported: return "This video's sound can't be read."
      case .failed(let message): return message
      }
    }
  }

  /// What an M4A file holds without re-encoding.
  private static let passthroughFormats: Set<AudioFormatID> = [
    kAudioFormatMPEG4AAC, kAudioFormatMPEG4AAC_HE, kAudioFormatMPEG4AAC_HE_V2,
    kAudioFormatMPEG4AAC_LD, kAudioFormatMPEG4AAC_ELD, kAudioFormatAppleLossless,
  ]

  static func extract(video: URL, destination: URL) async throws {
    let asset = AVURLAsset(
      url: video, options: [AVURLAssetPreferPreciseDurationAndTimingKey: true])
    let tracks = try await playedTracks(asset)
    guard !tracks.isEmpty else { throw ExtractError.noAudio }
    try FileManager.default.createDirectory(
      at: destination.deletingLastPathComponent(), withIntermediateDirectories: true)
    let composition = AVMutableComposition()
    for track in tracks {
      let range = try await track.load(.timeRange)
      guard
        let audio = composition.addMutableTrack(
          withMediaType: .audio, preferredTrackID: kCMPersistentTrackID_Invalid)
      else { throw ExtractError.unsupported }
      try audio.insertTimeRange(range, of: track, at: range.start)
    }
    if tracks.count == 1, let track = tracks.first, try await isPassthrough(track) {
      do {
        try await export(composition, preset: AVAssetExportPresetPassthrough, to: destination)
        return
      } catch {
        // Encoding below still gets the sound out.
      }
    }
    // A composition's tracks all play, so the encoder mixes them.
    try await export(composition, preset: AVAssetExportPresetAppleM4A, to: destination)
  }

  /// The audio tracks the video plays together. A disabled track is an
  /// alternative (another language, commentary), unless none is enabled.
  private static func playedTracks(_ asset: AVAsset) async throws -> [AVAssetTrack] {
    let tracks = try await asset.loadTracks(withMediaType: .audio)
    var enabled: [AVAssetTrack] = []
    for track in tracks where try await track.load(.isEnabled) { enabled.append(track) }
    return enabled.isEmpty ? tracks : enabled
  }

  private static func isPassthrough(_ track: AVAssetTrack) async throws -> Bool {
    let formats = try await track.load(.formatDescriptions)
    return formats.allSatisfy { passthroughFormats.contains(CMFormatDescriptionGetMediaSubType($0)) }
  }

  private static func export(_ asset: AVAsset, preset: String, to destination: URL) async throws {
    guard let session = AVAssetExportSession(asset: asset, presetName: preset) else {
      throw ExtractError.unsupported
    }
    let manager = FileManager.default
    if manager.fileExists(atPath: destination.path) { try manager.removeItem(at: destination) }
    if #available(iOS 18, macOS 15, *) {
      try await session.export(to: destination, as: .m4a)
    } else {
      session.outputURL = destination
      session.outputFileType = .m4a
      await session.export()
      guard session.status == .completed else {
        throw ExtractError.failed(session.error?.localizedDescription ?? "Export failed.")
      }
    }
  }
}
