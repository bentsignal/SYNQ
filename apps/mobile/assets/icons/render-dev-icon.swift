// Renders SYNQ Dev's icon (synq-dev.png) from SYNQ's (icon-blue.png): the
// same arrows, dark on an amber gradient, so the dev app is told apart from
// SYNQ and from every alternate icon (all of them are colored arrows on
// charcoal) at a glance on the home screen.
//
//   swift assets/icons/render-dev-icon.swift   (from apps/mobile)
import CoreGraphics
import Foundation
import ImageIO
import UniformTypeIdentifiers

let directory = URL(fileURLWithPath: "assets/icons")
let source = directory.appendingPathComponent("icon-blue.png")
let output = directory.appendingPathComponent("synq-dev.png")

guard
  let input = CGImageSourceCreateWithURL(source as CFURL, nil),
  let image = CGImageSourceCreateImageAtIndex(input, 0, nil)
else { fatalError("can't read \(source.path)") }
let size = image.width
precondition(size == image.height, "the icon must be square")

/// RGBA bytes of an image, top row first.
func pixels(of image: CGImage) -> [UInt8] {
  var bytes = [UInt8](repeating: 0, count: size * size * 4)
  let context = CGContext(
    data: &bytes, width: size, height: size, bitsPerComponent: 8,
    bytesPerRow: size * 4, space: CGColorSpace(name: CGColorSpace.sRGB)!,
    bitmapInfo: CGImageAlphaInfo.premultipliedLast.rawValue)!
  context.draw(image, in: CGRect(x: 0, y: 0, width: size, height: size))
  return bytes
}

let original = pixels(of: image)

/// Where the arrows are, from 0 to 1. The original's background is a gray
/// gradient (equal channels, the same across each row) and the arrows are
/// light blue with a blue channel near 250, so the blue channel's rise
/// over that row's gray is the arrows' coverage, antialiasing included.
func coverage(x: Int, y: Int) -> Double {
  let gray = Double(original[(y * size) * 4])
  let blue = Double(original[(y * size + x) * 4 + 2])
  return min(1, max(0, (blue - gray) / (250 - gray)))
}

/// Linear interpolation between two RGB colors.
func mix(_ a: [Double], _ b: [Double], _ t: Double) -> [Double] {
  zip(a, b).map { $0 + ($1 - $0) * t }
}

// Amber, light at the top to deep at the bottom (Vera Dev's amber is
// #ec8a1e), and arrows in SYNQ's near-black background color.
let amberTop: [Double] = [0xf8, 0xb2, 0x4a]
let amberBottom: [Double] = [0xdc, 0x6e, 0x12]
let arrows: [Double] = [0x14, 0x14, 0x14]

var result = [UInt8](repeating: 255, count: size * size * 4)
for y in 0..<size {
  let background = mix(amberTop, amberBottom, Double(y) / Double(size - 1))
  for x in 0..<size {
    let color = mix(background, arrows, coverage(x: x, y: y))
    for channel in 0..<3 {
      result[(y * size + x) * 4 + channel] = UInt8(color[channel].rounded())
    }
  }
}

let context = CGContext(
  data: &result, width: size, height: size, bitsPerComponent: 8,
  bytesPerRow: size * 4, space: CGColorSpace(name: CGColorSpace.sRGB)!,
  bitmapInfo: CGImageAlphaInfo.noneSkipLast.rawValue)!
guard
  let rendered = context.makeImage(),
  let destination = CGImageDestinationCreateWithURL(
    output as CFURL, UTType.png.identifier as CFString, 1, nil)
else { fatalError("can't write \(output.path)") }
CGImageDestinationAddImage(destination, rendered, nil)
precondition(CGImageDestinationFinalize(destination))
print(output.path)
