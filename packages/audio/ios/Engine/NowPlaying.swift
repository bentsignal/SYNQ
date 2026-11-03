import Foundation
import ImageIO
import MediaPlayer

#if canImport(UIKit)
import UIKit
typealias PlatformImage = UIImage
#elseif canImport(AppKit)
import AppKit
typealias PlatformImage = NSImage
#endif

/// Keeps `MPNowPlayingInfoCenter` in sync with the engine. Updated on item
/// change, play/pause, seek, and rate change only; the system extrapolates the
/// elapsed time from the rate in between.
@MainActor
final class NowPlayingController {
  private let publish: @MainActor ([String: Any]?) -> Void
  private let loadsArtwork: Bool
  private var info: [String: Any] = [:]
  /// Bumped on every item change so a slow artwork load for a previous item is
  /// dropped instead of overwriting the current one.
  private var generation: UInt64 = 0

  init(publish: @escaping @MainActor ([String: Any]?) -> Void, loadsArtwork: Bool) {
    self.publish = publish
    self.loadsArtwork = loadsArtwork
  }

  func setItem(
    _ track: Track,
    durationMs: Double,
    elapsedMs: Double,
    playing: Bool,
    queueIndex: Int?,
    queueCount: Int
  ) {
    generation &+= 1
    // A fresh dictionary drops the previous item's artwork, so only the
    // current item's image is retained.
    var next: [String: Any] = [
      MPMediaItemPropertyTitle: track.title,
      MPMediaItemPropertyArtist: track.artist,
      MPNowPlayingInfoPropertyMediaType: MPNowPlayingInfoMediaType.audio.rawValue,
      MPNowPlayingInfoPropertyDefaultPlaybackRate: 1.0,
    ]
    if let album = track.album { next[MPMediaItemPropertyAlbumTitle] = album }
    info = next
    applyTiming(elapsedMs: elapsedMs, durationMs: durationMs, playing: playing)
    applyQueue(index: queueIndex, count: queueCount)
    publish(info)

    if loadsArtwork, let artworkURL = track.artworkURL, artworkURL.isFileURL {
      loadArtwork(artworkURL, generation: generation)
    }
  }

  func updateTiming(elapsedMs: Double, durationMs: Double, playing: Bool) {
    guard !info.isEmpty else { return }
    applyTiming(elapsedMs: elapsedMs, durationMs: durationMs, playing: playing)
    publish(info)
  }

  func updateQueue(index: Int?, count: Int) {
    guard !info.isEmpty else { return }
    applyQueue(index: index, count: count)
    publish(info)
  }

  func clear() {
    generation &+= 1
    info = [:]
    publish(nil)
  }

  private func applyTiming(elapsedMs: Double, durationMs: Double, playing: Bool) {
    info[MPNowPlayingInfoPropertyElapsedPlaybackTime] = max(0, elapsedMs) / 1000
    info[MPNowPlayingInfoPropertyPlaybackRate] = playing ? 1.0 : 0.0
    if durationMs > 0 {
      info[MPMediaItemPropertyPlaybackDuration] = durationMs / 1000
    } else {
      info.removeValue(forKey: MPMediaItemPropertyPlaybackDuration)
    }
  }

  private func applyQueue(index: Int?, count: Int) {
    if let index {
      info[MPNowPlayingInfoPropertyPlaybackQueueIndex] = index
      info[MPNowPlayingInfoPropertyPlaybackQueueCount] = count
    } else {
      info.removeValue(forKey: MPNowPlayingInfoPropertyPlaybackQueueIndex)
      info.removeValue(forKey: MPNowPlayingInfoPropertyPlaybackQueueCount)
    }
  }

  private func loadArtwork(_ url: URL, generation: UInt64) {
    DispatchQueue.global(qos: .userInitiated).async { @Sendable [weak self] in
      guard let artwork = ArtworkLoader.artwork(at: url) else { return }
      dispatchToMain { [weak self] in
        guard let self, self.generation == generation, !self.info.isEmpty else { return }
        self.info[MPMediaItemPropertyArtwork] = artwork.value
        self.publish(self.info)
      }
    }
  }
}

/// `MPMediaItemArtwork` isn't Sendable; it is created off the main thread and
/// handed over exactly once.
struct ArtworkBox: @unchecked Sendable {
  let value: MPMediaItemArtwork
}

enum ArtworkLoader {
  /// Largest edge of the decoded image. The lock screen never shows artwork
  /// bigger than this, and decoding smaller keeps memory flat.
  static let maxPixelSize = 1024

  /// Decodes a downsampled image from a local file. Call off the main thread.
  static func artwork(at url: URL) -> ArtworkBox? {
    let sourceOptions = [kCGImageSourceShouldCache: false] as CFDictionary
    guard let source = CGImageSourceCreateWithURL(url as CFURL, sourceOptions) else { return nil }
    let options = [
      kCGImageSourceCreateThumbnailFromImageAlways: true,
      kCGImageSourceCreateThumbnailWithTransform: true,
      kCGImageSourceShouldCacheImmediately: true,
      kCGImageSourceThumbnailMaxPixelSize: maxPixelSize,
    ] as CFDictionary
    guard let cgImage = CGImageSourceCreateThumbnailAtIndex(source, 0, options) else { return nil }
    return makeArtwork(cgImage)
  }

  /// Nonisolated on purpose: MediaPlayer calls the request handler on a
  /// background queue.
  private static func makeArtwork(_ cgImage: CGImage) -> ArtworkBox {
    let size = CGSize(width: cgImage.width, height: cgImage.height)
    #if canImport(UIKit)
    let image = UIImage(cgImage: cgImage)
    #else
    let image = NSImage(cgImage: cgImage, size: size)
    #endif
    let box = ImageBox(image: image)
    let artwork = MPMediaItemArtwork(boundsSize: size) { @Sendable _ in box.image }
    return ArtworkBox(value: artwork)
  }

  private struct ImageBox: @unchecked Sendable {
    let image: PlatformImage
  }
}
