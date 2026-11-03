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

    let shortest = min(decoded.width, decoded.height)
    let inset = transparentCornerInset(of: decoded, side: shortest)
    let side = shortest - inset * 2
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

  /// How many pixels to crop from each side of art with its own transparent
  /// rounded corners, which JPEG would flatten into black wedges around the
  /// art. A rounded shape's corners are its only clear pixels near the sides,
  /// so cropping past them loses a sliver. 0 for anything else, such as a logo
  /// on a transparent field, which keeps the black behind it.
  private static func transparentCornerInset(of image: CGImage, side: Int) -> Int {
    switch image.alphaInfo {
    case .none, .noneSkipFirst, .noneSkipLast: return 0
    default: break
    }
    let probe = 128
    var alpha = [UInt8](repeating: 0, count: probe * probe)
    let drawn: Bool = alpha.withUnsafeMutableBytes { buffer in
      guard
        let context = CGContext(
          data: buffer.baseAddress, width: probe, height: probe, bitsPerComponent: 8,
          bytesPerRow: probe, space: CGColorSpaceCreateDeviceGray(),
          bitmapInfo: CGImageAlphaInfo.alphaOnly.rawValue)
      else { return false }
      let dx = (image.width - side) / 2
      let dy = (image.height - side) / 2
      guard let square = image.cropping(to: CGRect(x: dx, y: dy, width: side, height: side))
      else { return false }
      context.draw(square, in: CGRect(x: 0, y: 0, width: probe, height: probe))
      return true
    }
    guard drawn else { return 0 }
    func opaque(_ x: Int, _ y: Int) -> Bool { alpha[y * probe + x] >= 250 }

    let last = probe - 1
    let middle = probe / 2
    guard opaque(middle, 0), opaque(middle, last), opaque(0, middle), opaque(last, middle)
    else { return 0 }
    var reach = 0
    for (x, y, stepX, stepY) in [(0, 0, 1, 1), (last, 0, -1, 1), (0, last, 1, -1), (last, last, -1, -1)] {
      var step = 0
      while step < 18, !opaque(x + step * stepX, y + step * stepY) { step += 1 }
      if step == 18 { return 0 }
      reach = max(reach, step)
    }
    return reach == 0 ? 0 : (reach + 1) * side / probe
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
