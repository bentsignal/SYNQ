// The player backdrop's real analysis and real shader, on the Mac, so color
// ideas can be judged on real covers without a device. Driven by lab.mjs.
//
//   backdrop-lab analyze <image>           prints the analysis as JSON
//   backdrop-lab render <jobs.json>        draws each job to its PNG
//   backdrop-lab sheet <sheet.json>        lays renders out as a player mock-up grid
import CoreGraphics
import CoreText
import Foundation
import ImageIO
import Metal
import UniformTypeIdentifiers

struct Job: Decodable {
  struct Swatch: Decodable {
    let color: String
    let x: Float
    let y: Float
    let weight: Float
  }
  struct Shading: Decodable {
    let falloff: Float
    let oklab: Bool
    let saturation: Float
    let restore: Float
  }
  let out: String
  let time: Float
  let swatches: [Swatch]
  let look: Shading
}

let width = 390
let height = 844

func analyze(_ path: String) throws {
  guard let result = ArtworkAnalysis.read(imageURL: URL(fileURLWithPath: path)) else {
    throw NSError(domain: "lab", code: 1, userInfo: [NSLocalizedDescriptionKey: "unreadable \(path)"])
  }
  let json: [String: Any] = [
    "clusters": result.clusters.map {
      ["color": $0.color, "x": $0.x, "y": $0.y, "population": $0.population] as [String: Any]
    },
    "grid": result.grid,
    "cornerInset": result.cornerInset,
  ]
  FileHandle.standardOutput.write(try JSONSerialization.data(withJSONObject: json))
}

func render(_ path: String) throws {
  let jobs = try JSONDecoder().decode([Job].self, from: Data(contentsOf: URL(fileURLWithPath: path)))
  guard let device = MTLCreateSystemDefaultDevice(), let queue = device.makeCommandQueue() else {
    throw NSError(domain: "lab", code: 2, userInfo: [NSLocalizedDescriptionKey: "no Metal"])
  }
  let pipeline = try BackdropShader.makePipeline(device: device, format: .bgra8Unorm)
  let descriptor = MTLTextureDescriptor.texture2DDescriptor(
    pixelFormat: .bgra8Unorm, width: width, height: height, mipmapped: false)
  descriptor.usage = .renderTarget
  descriptor.storageMode = .shared
  guard let texture = device.makeTexture(descriptor: descriptor) else { return }
  for job in jobs {
    let pass = MTLRenderPassDescriptor()
    pass.colorAttachments[0].texture = texture
    pass.colorAttachments[0].loadAction = .dontCare
    pass.colorAttachments[0].storeAction = .store
    guard let commands = queue.makeCommandBuffer(),
      let encoder = commands.makeRenderCommandEncoder(descriptor: pass)
    else { continue }
    let uniforms = BackdropShader.Uniforms(
      time: job.time, aspect: Float(width) / Float(height),
      look: BackdropShader.Look(
        falloff: job.look.falloff, oklab: job.look.oklab, saturation: job.look.saturation,
        restore: job.look.restore),
      colors: job.swatches.map { BackdropShader.rgba($0.color) },
      pools: job.swatches.map { SIMD4($0.x, $0.y, $0.weight, 0) })
    BackdropShader.encode(uniforms, pipeline: pipeline, into: encoder)
    commands.commit()
    commands.waitUntilCompleted()
    var bytes = [UInt8](repeating: 0, count: width * height * 4)
    texture.getBytes(
      &bytes, bytesPerRow: width * 4, from: MTLRegionMake2D(0, 0, width, height), mipmapLevel: 0)
    let image = bytes.withUnsafeMutableBytes { buffer -> CGImage? in
      CGContext(
        data: buffer.baseAddress, width: width, height: height, bitsPerComponent: 8,
        bytesPerRow: width * 4, space: CGColorSpace(name: CGColorSpace.sRGB)!,
        bitmapInfo: CGImageAlphaInfo.noneSkipFirst.rawValue | CGBitmapInfo.byteOrder32Little.rawValue
      )?.makeImage()
    }
    // The brightest the backdrop gets behind the text (from the title down),
    // for the report in lab.mjs.
    func linear(_ byte: UInt8) -> Double {
      let c = Double(byte) / 255
      return c <= 0.040_45 ? c / 12.92 : pow((c + 0.055) / 1.055, 2.4)
    }
    var brightest = 0.0
    for y in stride(from: height * 55 / 100, to: height, by: 4) {
      for x in stride(from: 0, to: width, by: 4) {
        let at = (y * width + x) * 4
        // BGRA.
        brightest = max(
          brightest,
          0.2126 * linear(bytes[at + 2]) + 0.7152 * linear(bytes[at + 1]) + 0.0722 * linear(bytes[at]))
      }
    }
    print("\(job.out)\t\(brightest)")
    guard let image,
      let target = CGImageDestinationCreateWithURL(
        URL(fileURLWithPath: job.out) as CFURL, UTType.png.identifier as CFString, 1, nil)
    else { continue }
    CGImageDestinationAddImage(target, image, nil)
    CGImageDestinationFinalize(target)
  }
}

struct Sheet: Decodable {
  struct Row: Decodable {
    let name: String
    let cover: String
    let cells: [String]
  }
  let out: String
  let columns: [String]
  let rows: [Row]
}

func loadImage(_ path: String) -> CGImage? {
  guard let source = CGImageSourceCreateWithURL(URL(fileURLWithPath: path) as CFURL, nil) else {
    return nil
  }
  return CGImageSourceCreateImageAtIndex(source, 0, nil)
}

func drawText(_ text: String, in context: CGContext, x: CGFloat, y: CGFloat, size: CGFloat, alpha: CGFloat = 1) {
  let font = CTFontCreateWithName("HelveticaNeue-Medium" as CFString, size, nil)
  let attributes: [NSAttributedString.Key: Any] = [
    .init(kCTFontAttributeName as String): font,
    .init(kCTForegroundColorAttributeName as String): CGColor(gray: 1, alpha: alpha),
  ]
  let line = CTLineCreateWithAttributedString(NSAttributedString(string: text, attributes: attributes))
  context.textPosition = CGPoint(x: x, y: y)
  CTLineDraw(line, context)
}

/// A rough player over each render, since a color can't be judged without
/// the cover and white text in front of it.
func sheet(_ path: String) throws {
  let spec = try JSONDecoder().decode(Sheet.self, from: Data(contentsOf: URL(fileURLWithPath: path)))
  let cellWidth: CGFloat = 195
  let cellHeight: CGFloat = 422
  let gap: CGFloat = 8
  let header: CGFloat = 26
  let canvasWidth = CGFloat(spec.columns.count) * (cellWidth + gap) + gap
  let canvasHeight = header + CGFloat(spec.rows.count) * (cellHeight + gap + 18) + gap
  guard
    let context = CGContext(
      data: nil, width: Int(canvasWidth), height: Int(canvasHeight), bitsPerComponent: 8,
      bytesPerRow: 0, space: CGColorSpace(name: CGColorSpace.sRGB)!,
      bitmapInfo: CGImageAlphaInfo.premultipliedLast.rawValue)
  else { return }
  context.setFillColor(gray: 0, alpha: 1)
  context.fill(CGRect(x: 0, y: 0, width: canvasWidth, height: canvasHeight))
  for (column, label) in spec.columns.enumerated() {
    drawText(
      label, in: context, x: gap + CGFloat(column) * (cellWidth + gap) + 4,
      y: canvasHeight - 18, size: 14)
  }
  func rounded(_ rect: CGRect, _ radius: CGFloat) -> CGPath {
    CGPath(roundedRect: rect, cornerWidth: radius, cornerHeight: radius, transform: nil)
  }
  for (rowIndex, row) in spec.rows.enumerated() {
    let top = canvasHeight - header - CGFloat(rowIndex) * (cellHeight + gap + 18) - 18
    drawText(row.name, in: context, x: gap + 4, y: top + 4, size: 11, alpha: 0.6)
    let cover = loadImage(row.cover)
    for (column, cell) in row.cells.enumerated() {
      let x = gap + CGFloat(column) * (cellWidth + gap)
      let frame = CGRect(x: x, y: top - cellHeight, width: cellWidth, height: cellHeight)
      context.saveGState()
      context.addPath(rounded(frame, 18))
      context.clip()
      if let image = loadImage(cell) { context.draw(image, in: frame) }
      let side: CGFloat = 164
      let art = CGRect(x: x + (cellWidth - side) / 2, y: frame.maxY - 26 - side, width: side, height: side)
      context.saveGState()
      context.setShadow(offset: CGSize(width: 0, height: -6), blur: 16, color: CGColor(gray: 0, alpha: 0.35))
      context.addPath(rounded(art, 5))
      context.setFillColor(gray: 0, alpha: 1)
      context.fillPath()
      context.restoreGState()
      context.saveGState()
      context.addPath(rounded(art, 5))
      context.clip()
      if let cover { context.draw(cover, in: art) }
      context.restoreGState()
      drawText("Song Title", in: context, x: art.minX, y: art.minY - 28, size: 14)
      drawText("Artist Name", in: context, x: art.minX, y: art.minY - 44, size: 11.5, alpha: 0.6)
      context.setFillColor(gray: 1, alpha: 0.28)
      context.fill(CGRect(x: art.minX, y: art.minY - 72, width: side, height: 3))
      context.setFillColor(gray: 1, alpha: 0.9)
      context.fill(CGRect(x: art.minX, y: art.minY - 72, width: side * 0.45, height: 3))
      for (index, symbol) in ["\u{25C0}\u{25C0}", "\u{2759}\u{2759}", "\u{25B6}\u{25B6}"].enumerated() {
        drawText(
          symbol, in: context, x: art.minX + 30 + CGFloat(index) * 44, y: art.minY - 118, size: 15)
      }
      context.restoreGState()
    }
  }
  guard let image = context.makeImage(),
    let target = CGImageDestinationCreateWithURL(
      URL(fileURLWithPath: spec.out) as CFURL, UTType.png.identifier as CFString, 1, nil)
  else { return }
  CGImageDestinationAddImage(target, image, nil)
  CGImageDestinationFinalize(target)
}

let arguments = CommandLine.arguments
switch arguments.count > 2 ? arguments[1] : "" {
case "analyze": try analyze(arguments[2])
case "render": try render(arguments[2])
case "sheet": try sheet(arguments[2])
default:
  FileHandle.standardError.write(Data("usage: backdrop-lab analyze|render|sheet <path>\n".utf8))
  exit(2)
}
