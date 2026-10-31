import CoreGraphics
import Foundation
import ImageIO
import UniformTypeIdentifiers

/// Writes an entity's artwork the way 2.5.2 stored it: `cover_full.jpg`
/// (at most 1500 px) and `cover_small.jpg` (at most 200 px). Non-square
/// images are center-cropped to a square, keeping their aspect (2.5.2
/// stretched them). Each file is written beside its target and moved into
/// place, so a reader never sees half a cover.
enum Covers {
  enum CoverError: Error, CustomStringConvertible {
    case unreadable
    case unwritable

    var description: String {
      switch self {
      case .unreadable: return "The image couldn't be read."
      case .unwritable: return "The cover couldn't be written."
      }
    }
  }

  static let fullSide = 1500
  static let smallSide = 200

  static func write(imageURL: URL, directoryURL: URL) throws {
    guard let source = CGImageSourceCreateWithURL(imageURL as CFURL, nil),
      let properties = CGImageSourceCopyPropertiesAtIndex(source, 0, nil) as? [CFString: Any],
      let width = properties[kCGImagePropertyPixelWidth] as? Int,
      let height = properties[kCGImagePropertyPixelHeight] as? Int,
      width > 0, height > 0
    else { throw CoverError.unreadable }

    // Decode at the smallest size whose shorter side still covers the full
    // cover, oriented upright.
    let shorter = min(width, height)
    let longer = max(width, height)
    let target = min(shorter, fullSide)
    let maxPixel = Int((Double(longer) * Double(target) / Double(shorter)).rounded(.up))
    let options: [CFString: Any] = [
      kCGImageSourceCreateThumbnailFromImageAlways: true,
      kCGImageSourceCreateThumbnailWithTransform: true,
      kCGImageSourceThumbnailMaxPixelSize: maxPixel,
      kCGImageSourceShouldCacheImmediately: true,
    ]
    guard let decoded = CGImageSourceCreateThumbnailAtIndex(source, 0, options as CFDictionary)
    else { throw CoverError.unreadable }

    let side = min(decoded.width, decoded.height)
    let crop = CGRect(
      x: (decoded.width - side) / 2, y: (decoded.height - side) / 2, width: side, height: side)
    guard let square = decoded.cropping(to: crop),
      let full = render(square, side: min(side, fullSide)),
      let small = render(square, side: min(side, smallSide))
    else { throw CoverError.unreadable }

    try FileManager.default.createDirectory(at: directoryURL, withIntermediateDirectories: true)
    try writeJPEG(full, to: directoryURL.appendingPathComponent("cover_full.jpg"), quality: 0.9)
    try writeJPEG(small, to: directoryURL.appendingPathComponent("cover_small.jpg"), quality: 0.85)
  }

  /// Draws `image` into an opaque sRGB square (JPEG has no alpha; transparent
  /// areas become black, matching the app's dark background).
  private static func render(_ image: CGImage, side: Int) -> CGImage? {
    guard let space = CGColorSpace(name: CGColorSpace.sRGB),
      let context = CGContext(
        data: nil, width: side, height: side, bitsPerComponent: 8, bytesPerRow: 0, space: space,
        bitmapInfo: CGImageAlphaInfo.noneSkipLast.rawValue)
    else { return nil }
    context.setFillColor(CGColor(gray: 0, alpha: 1))
    context.fill(CGRect(x: 0, y: 0, width: side, height: side))
    context.interpolationQuality = .high
    context.draw(image, in: CGRect(x: 0, y: 0, width: side, height: side))
    return context.makeImage()
  }

  private static func writeJPEG(_ image: CGImage, to url: URL, quality: Double) throws {
    let temporary = url.deletingLastPathComponent()
      .appendingPathComponent(".\(UUID().uuidString)-\(url.lastPathComponent)")
    guard
      let destination = CGImageDestinationCreateWithURL(
        temporary as CFURL, UTType.jpeg.identifier as CFString, 1, nil)
    else { throw CoverError.unwritable }
    CGImageDestinationAddImage(
      destination, image, [kCGImageDestinationLossyCompressionQuality: quality] as CFDictionary)
    guard CGImageDestinationFinalize(destination) else {
      try? FileManager.default.removeItem(at: temporary)
      throw CoverError.unwritable
    }
    if FileManager.default.fileExists(atPath: url.path) {
      _ = try FileManager.default.replaceItemAt(url, withItemAt: temporary)
    } else {
      try FileManager.default.moveItem(at: temporary, to: url)
    }
  }
}
