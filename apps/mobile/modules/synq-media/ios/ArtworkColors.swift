import CoreImage

/// The player's backdrop colors: the average color of a cover's top and
/// bottom thirds, so the gradient behind the player runs the way the art
/// does (2.5.2's look). Reads the 200 px cover, which averages the same as
/// the full one at a fraction of the cost.
enum ArtworkColors {
  private static let context = CIContext(options: [.workingColorSpace: NSNull()])

  /// `["#rrggbb", "#rrggbb"]` (top, bottom), or none for an unreadable image.
  static func read(imageURL: URL) -> [String] {
    guard let image = CIImage(contentsOf: imageURL) else { return [] }
    let extent = image.extent
    let third = extent.height / 3
    // Core Image's origin is the bottom left.
    let top = CGRect(x: extent.minX, y: extent.maxY - third, width: extent.width, height: third)
    let bottom = CGRect(x: extent.minX, y: extent.minY, width: extent.width, height: third)
    return [top, bottom].compactMap { average(of: image, in: $0) }
  }

  private static func average(of image: CIImage, in rect: CGRect) -> String? {
    guard
      let filter = CIFilter(
        name: "CIAreaAverage",
        parameters: [kCIInputImageKey: image, kCIInputExtentKey: CIVector(cgRect: rect)]),
      let output = filter.outputImage
    else { return nil }
    var pixel = [UInt8](repeating: 0, count: 4)
    // The one-pixel average sits at the region's origin, not at zero.
    context.render(
      output, toBitmap: &pixel, rowBytes: 4,
      bounds: CGRect(x: rect.minX, y: rect.minY, width: 1, height: 1),
      format: .RGBA8, colorSpace: CGColorSpaceCreateDeviceRGB())
    return String(format: "#%02x%02x%02x", pixel[0], pixel[1], pixel[2])
  }
}
