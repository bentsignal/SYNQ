// Renders the arrows from icon-blue.png as a small white mask for Wi-Fi
// Transfer's page, which draws them in the theme's accent, as the alternate
// icons do, and writes src/features/import/transfer-page-logo.ts.
//
//   swift assets/icons/render-page-logo.swift   (from apps/mobile)
import CoreGraphics
import Foundation
import ImageIO
import UniformTypeIdentifiers

let source = URL(fileURLWithPath: "assets/icons/icon-blue.png")
let output = URL(fileURLWithPath: "src/features/import/transfer-page-logo.ts")
/// Three times its size on the page.
let outputSize = 96

guard
  let input = CGImageSourceCreateWithURL(source as CFURL, nil),
  let image = CGImageSourceCreateImageAtIndex(input, 0, nil)
else { fatalError("can't read \(source.path)") }
let size = image.width
let sRGB = CGColorSpace(name: CGColorSpace.sRGB)!

var original = [UInt8](repeating: 0, count: size * size * 4)
CGContext(
  data: &original, width: size, height: size, bitsPerComponent: 8, bytesPerRow: size * 4,
  space: sRGB, bitmapInfo: CGImageAlphaInfo.premultipliedLast.rawValue
)!.draw(image, in: CGRect(x: 0, y: 0, width: size, height: size))

// The background is a gray gradient, the same across each row, and the arrows
// have a blue channel near 250, so blue's rise over that row's gray is their
// coverage, antialiasing included (render-dev-icon.swift).
var mask = [UInt8](repeating: 0, count: size * size * 4)
for y in 0..<size {
  let gray = Double(original[(y * size) * 4])
  for x in 0..<size {
    let blue = Double(original[(y * size + x) * 4 + 2])
    let coverage = UInt8(min(1, max(0, (blue - gray) / (250 - gray))) * 255)
    for channel in 0..<4 { mask[(y * size + x) * 4 + channel] = coverage }
  }
}
let full = CGContext(
  data: &mask, width: size, height: size, bitsPerComponent: 8, bytesPerRow: size * 4,
  space: sRGB, bitmapInfo: CGImageAlphaInfo.premultipliedLast.rawValue)!.makeImage()!

let small = CGContext(
  data: nil, width: outputSize, height: outputSize, bitsPerComponent: 8, bytesPerRow: 0,
  space: sRGB, bitmapInfo: CGImageAlphaInfo.premultipliedLast.rawValue)!
small.interpolationQuality = .high
small.draw(full, in: CGRect(x: 0, y: 0, width: outputSize, height: outputSize))

let data = NSMutableData()
let destination = CGImageDestinationCreateWithData(
  data, UTType.png.identifier as CFString, 1, nil)!
CGImageDestinationAddImage(destination, small.makeImage()!, nil)
CGImageDestinationFinalize(destination)

let text = """
  /**
   * The arrows of the app icon as a white mask, inline because the page has to
   * work with no internet. The page draws them in the theme's accent, as the
   * alternate icons do. From `assets/icons/render-page-logo.swift`.
   */
  export const TRANSFER_LOGO_MASK =
    "data:image/png;base64,\((data as Data).base64EncodedString())";

  """
try text.write(to: output, atomically: true, encoding: .utf8)
print("\(data.length) bytes")
