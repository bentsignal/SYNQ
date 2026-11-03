import CoreGraphics
import Foundation
import ImageIO

/// What the player needs to know about a cover, from a small copy of it:
/// its colors, clustered so a sliver of color on a black cover gets its own
/// cluster, and how far any rounded corners baked into the art reach.
/// Choosing colors from the clusters is JavaScript's job
/// (`backdrop-palette.ts`), where it can be tested and updated.
enum ArtworkAnalysis {
  struct Cluster {
    let color: String
    /// The cluster's center on the cover, 0–1 from the top left.
    let x: Double
    let y: Double
    /// The share of the cover's pixels in the cluster, 0–1.
    let population: Double
  }

  struct Result {
    let clusters: [Cluster]
    /// How far in the art's corners start along each axis, as a share of
    /// the side; 0 for a cover that reaches its corners.
    let cornerInset: Double
  }

  /// Fine enough to find a corner's edge; clustering takes every other pixel.
  private static let side = 128
  private static let clusterCount = 8
  private static let iterations = 8
  /// How much more a fully saturated pixel counts than a grey one. A small
  /// area of color outweighs a large area of black in the clustering, not
  /// in the population it reports.
  private static let chromaPull: Float = 80

  static func read(imageURL: URL) -> Result? {
    guard let pixels = decode(imageURL) else { return nil }
    return Result(
      clusters: clusters(of: pixels.indices.compactMap { index in
        index % 2 == 0 && (index / side) % 2 == 0 ? pixels[index] : nil
      }),
      cornerInset: cornerInset(of: pixels))
  }

  // MARK: Pixels

  private struct Pixel {
    /// Oklab, where distances look like differences in color.
    var lab: SIMD3<Float>
    var position: SIMD2<Float>
    var weight: Float
  }

  /// The cover as `side`×`side` pixels, row by row from the top; nil where
  /// it's transparent.
  private static func decode(_ url: URL) -> [Pixel?]? {
    guard let source = CGImageSourceCreateWithURL(url as CFURL, nil),
      let image = CGImageSourceCreateThumbnailAtIndex(
        source, 0,
        [
          kCGImageSourceCreateThumbnailFromImageAlways: true,
          kCGImageSourceCreateThumbnailWithTransform: true,
          kCGImageSourceThumbnailMaxPixelSize: 256,
        ] as CFDictionary),
      let space = CGColorSpace(name: CGColorSpace.sRGB)
    else { return nil }
    var bytes = [UInt8](repeating: 0, count: side * side * 4)
    let drawn: Bool = bytes.withUnsafeMutableBytes { buffer in
      guard
        let context = CGContext(
          data: buffer.baseAddress, width: side, height: side, bitsPerComponent: 8,
          bytesPerRow: side * 4, space: space,
          bitmapInfo: CGImageAlphaInfo.premultipliedLast.rawValue)
      else { return false }
      context.interpolationQuality = .medium
      context.draw(image, in: CGRect(x: 0, y: 0, width: side, height: side))
      return true
    }
    guard drawn else { return nil }
    return (0..<(side * side)).map { index in
      let offset = index * 4
      let alpha = Float(bytes[offset + 3]) / 255
      guard alpha >= 0.5 else { return nil }
      let lab = oklab(
        SIMD3(Float(bytes[offset]), Float(bytes[offset + 1]), Float(bytes[offset + 2])) / 255
          / alpha)
      let chroma = (lab.y * lab.y + lab.z * lab.z).squareRoot()
      return Pixel(
        lab: lab,
        position: SIMD2(
          (Float(index % side) + 0.5) / Float(side), (Float(index / side) + 0.5) / Float(side)),
        weight: 1 + chromaPull * chroma)
    }
  }

  // MARK: Clusters

  /// Weighted k-means in Oklab, seeded farthest-first: the same cover always
  /// gives the same clusters, and a small, different area gets a seed of its
  /// own instead of being averaged away.
  private static func clusters(of pixels: [Pixel]) -> [Cluster] {
    guard let heaviest = pixels.max(by: { $0.weight < $1.weight }) else { return [] }
    var centers = [heaviest.lab]
    while centers.count < clusterCount {
      var farthest = heaviest
      var score: Float = 0
      for pixel in pixels {
        let distance = centers.map { squaredDistance(pixel.lab, $0) }.min() ?? 0
        if distance * pixel.weight > score {
          score = distance * pixel.weight
          farthest = pixel
        }
      }
      // Fewer distinct colors than clusters.
      if score < 0.000_1 { break }
      centers.append(farthest.lab)
    }

    var assignment = [Int](repeating: 0, count: pixels.count)
    for _ in 0..<iterations {
      var sums = [SIMD3<Float>](repeating: .zero, count: centers.count)
      var weights = [Float](repeating: 0, count: centers.count)
      for (index, pixel) in pixels.enumerated() {
        let nearest = nearestCenter(to: pixel.lab, in: centers)
        assignment[index] = nearest
        sums[nearest] += pixel.lab * pixel.weight
        weights[nearest] += pixel.weight
      }
      for index in centers.indices where weights[index] > 0 {
        centers[index] = sums[index] / weights[index]
      }
    }

    var positions = [SIMD2<Float>](repeating: .zero, count: centers.count)
    var counts = [Int](repeating: 0, count: centers.count)
    for (index, pixel) in pixels.enumerated() {
      positions[assignment[index]] += pixel.position
      counts[assignment[index]] += 1
    }
    return centers.indices.compactMap { index in
      guard counts[index] > 0 else { return nil }
      let position = positions[index] / Float(counts[index])
      return Cluster(
        color: hex(centers[index]),
        x: Double(position.x),
        y: Double(position.y),
        population: Double(counts[index]) / Double(pixels.count))
    }
  }

  private static func nearestCenter(to lab: SIMD3<Float>, in centers: [SIMD3<Float>]) -> Int {
    var best = 0
    var bestDistance = Float.greatestFiniteMagnitude
    for (index, center) in centers.enumerated() {
      let distance = squaredDistance(lab, center)
      if distance < bestDistance {
        bestDistance = distance
        best = index
      }
    }
    return best
  }

  private static func squaredDistance(_ a: SIMD3<Float>, _ b: SIMD3<Float>) -> Float {
    let delta = a - b
    return (delta * delta).sum()
  }

  // MARK: Corners

  /// The widest corners may reach before they read as part of the design:
  /// a card on a black field, not a rounded cover.
  private static let maxCornerInset = 18
  /// How different (in Oklab) the art must be from the corner's color.
  private static let cornerDifference: Float = 0.08

  /// A cover with its own rounded corners, whether they're still transparent
  /// or were flattened to a color: all four corners hold the same nothing up
  /// to a sharp edge, and the middle of each side doesn't. Walks each corner
  /// along its diagonal to the edge. 0 unless all four agree, so a dark photo
  /// or a cover with a border is left alone.
  private static func cornerInset(of pixels: [Pixel?]) -> Double {
    func pixel(_ x: Int, _ y: Int) -> Pixel? { pixels[y * side + x] }
    func matches(_ a: Pixel?, _ b: Pixel?) -> Bool {
      guard let a, let b else { return a == nil && b == nil }
      return squaredDistance(a.lab, b.lab) < cornerDifference * cornerDifference
    }

    let last = side - 1
    let corners = [(0, 0, 1, 1), (last, 0, -1, 1), (0, last, 1, -1), (last, last, -1, -1)]
    let wedge = pixel(0, 0)
    var reach = 0
    for (x, y, stepX, stepY) in corners {
      guard matches(pixel(x, y), wedge) else { return 0 }
      var step = 0
      while step <= maxCornerInset, matches(pixel(x + step * stepX, y + step * stepY), wedge) {
        step += 1
      }
      guard step > 0, step <= maxCornerInset else { return 0 }
      reach = max(reach, step)
    }
    // The art runs to the edge of every side, and the corner's color isn't
    // simply the background the art sits on.
    let middle = side / 2
    for (x, y) in [(middle, 0), (middle, last), (0, middle), (last, middle)]
    where matches(pixel(x, y), wedge) {
      return 0
    }
    // One pixel more, for the edge's own softness.
    return Double(reach + 1) / Double(side)
  }

  // MARK: Color

  private static func oklab(_ srgb: SIMD3<Float>) -> SIMD3<Float> {
    let r = linear(srgb.x)
    let g = linear(srgb.y)
    let b = linear(srgb.z)
    let l = cbrtf(0.412_221_47 * r + 0.536_332_54 * g + 0.051_445_99 * b)
    let m = cbrtf(0.211_903_50 * r + 0.680_699_55 * g + 0.107_396_96 * b)
    let s = cbrtf(0.088_302_46 * r + 0.281_718_84 * g + 0.629_978_70 * b)
    return SIMD3(
      0.210_454_26 * l + 0.793_617_79 * m - 0.004_072_05 * s,
      1.977_998_50 * l - 2.428_592_21 * m + 0.450_593_71 * s,
      0.025_904_04 * l + 0.782_771_77 * m - 0.808_675_77 * s)
  }

  private static func hex(_ lab: SIMD3<Float>) -> String {
    let l = powf(lab.x + 0.396_337_78 * lab.y + 0.215_803_76 * lab.z, 3)
    let m = powf(lab.x - 0.105_561_35 * lab.y - 0.063_854_17 * lab.z, 3)
    let s = powf(lab.x - 0.089_484_18 * lab.y - 1.291_485_55 * lab.z, 3)
    let r = 4.076_741_66 * l - 3.307_711_59 * m + 0.230_969_93 * s
    let g = -1.268_438_00 * l + 2.609_757_40 * m - 0.341_319_40 * s
    let b = -0.004_196_09 * l - 0.703_418_61 * m + 1.707_614_70 * s
    return String(format: "#%02x%02x%02x", byte(r), byte(g), byte(b))
  }

  private static func byte(_ value: Float) -> Int {
    Int((gamma(max(0, min(1, value))) * 255).rounded())
  }

  private static func linear(_ c: Float) -> Float {
    c <= 0.040_45 ? c / 12.92 : powf((c + 0.055) / 1.055, 2.4)
  }

  private static func gamma(_ c: Float) -> Float {
    c <= 0.003_130_8 ? c * 12.92 : 1.055 * powf(c, 1 / 2.4) - 0.055
  }
}
