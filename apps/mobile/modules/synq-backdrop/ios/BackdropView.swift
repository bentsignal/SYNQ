import ExpoModulesCore
import Metal
import QuartzCore
import UIKit

/// One pool of color in the backdrop, from `backdrop-palette.ts`.
struct BackdropSwatch: Record, Equatable {
  @Field var color: String = "#141414"
  @Field var x: Double = 0.5
  @Field var y: Double = 0.5
  @Field var weight: Double = 1

  static func == (a: BackdropSwatch, b: BackdropSwatch) -> Bool {
    a.color == b.color && a.x == b.x && a.y == b.y && a.weight == b.weight
  }
}

/// How the pools mix, from `backdrop-variants.ts`.
struct BackdropLook: Record {
  @Field var falloff: Double = 1.5
  @Field var oklab: Bool = false
  @Field var saturation: Double = 1
  @Field var restore: Double = 0
}

/// The player's backdrop: colors from the cover, drifting slowly, drawn by a
/// fragment shader into a Metal layer at one pixel per point, 30 times a
/// second. All the work is here on the GPU, with no JavaScript per frame.
///
/// It draws only while it can be seen: not when off screen, not when the app
/// is inactive or in the background, and not while `animating` is false.
/// Reduce Motion holds the field still; a new song still crossfades, since
/// a fade isn't motion.
final class BackdropView: ExpoView {
  /// Frames drawn, for `frameStats()`: what a frame costs, and that nothing
  /// draws when nothing should.
  static var stats = (frames: 0, encodeSeconds: 0.0, gpuSeconds: 0.0, gpuFrames: 0)

  var animating = true {
    didSet { updateRunning() }
  }

  var look = BackdropShader.Look() {
    didSet {
      guard look != oldValue else { return }
      needsDraw = true
      drawIfStill()
    }
  }

  private let metal = MetalView()
  private let inFlight = DispatchSemaphore(value: 1)
  private var link: CADisplayLink?
  private var lastTick: CFTimeInterval = 0

  /// Where the field's motion is. Keeps its place through a pause.
  private var time = Double.random(in: 0..<600)

  private var shown = Frame.empty
  private var fading: (from: Frame, to: Frame, progress: Double)?
  private var hasSwatches = false
  private var needsDraw = true
  private var active: Bool

  private static let fadeSeconds = 0.9

  required init(appContext: AppContext? = nil) {
    active = UIApplication.shared.applicationState == .active
    super.init(appContext: appContext)
    isUserInteractionEnabled = false
    addSubview(metal)
    let center = NotificationCenter.default
    center.addObserver(
      self, selector: #selector(reduceMotionChanged),
      name: UIAccessibility.reduceMotionStatusDidChangeNotification, object: nil)
    center.addObserver(
      self, selector: #selector(becameActive),
      name: UIApplication.didBecomeActiveNotification, object: nil)
    center.addObserver(
      self, selector: #selector(resignedActive),
      name: UIApplication.willResignActiveNotification, object: nil)
    // Metal compiles once, while the first sheet opens; that first backdrop
    // eases in over what's behind it.
    if BackdropPipeline.shared.pipeline == nil {
      metal.alpha = 0
      BackdropPipeline.shared.prepare { [weak self] in self?.pipelineReady() }
    }
  }

  deinit {
    link?.invalidate()
  }

  func setSwatches(_ swatches: [BackdropSwatch]) {
    let next = Frame(swatches: swatches)
    guard next != fading?.to ?? shown else { return }
    // The first colors of a new view are just there; it hasn't shown any yet.
    fading = hasSwatches ? (from: current, to: next, progress: 0) : nil
    if !hasSwatches { shown = next }
    hasSwatches = true
    needsDraw = true
    updateRunning()
    drawIfStill()
  }

  override func layoutSubviews() {
    super.layoutSubviews()
    guard metal.frame != bounds else { return }
    metal.frame = bounds
    // One pixel per point: the field has no detail for more to show, and
    // this is a ninth of the pixels of a full-resolution layer.
    metal.metalLayer.drawableSize = bounds.size
    needsDraw = true
    drawIfStill()
  }

  override func didMoveToWindow() {
    super.didMoveToWindow()
    updateRunning()
    drawIfStill()
  }

  @objc private func reduceMotionChanged() {
    updateRunning()
    drawIfStill()
  }

  @objc private func becameActive() {
    active = true
    // The system may have discarded the last frame while away.
    needsDraw = true
    updateRunning()
    drawIfStill()
  }

  /// Comes before the background too. The app's state still reads active at
  /// this point, so it can't be asked.
  @objc private func resignedActive() {
    active = false
    updateRunning()
  }

  private func pipelineReady() {
    needsDraw = true
    drawIfStill()
    updateRunning()
    UIView.animate(withDuration: 0.25) { self.metal.alpha = 1 }
  }

  /// Draws on a tick while something can move.
  private var shouldRun: Bool {
    guard window != nil, active, animating || fading != nil, hasSwatches,
      BackdropPipeline.shared.pipeline != nil
    else { return false }
    return fading != nil || !UIAccessibility.isReduceMotionEnabled
  }

  private func updateRunning() {
    if shouldRun {
      guard link == nil else { return }
      let link = CADisplayLink(target: WeakTick(self), selector: #selector(WeakTick.tick))
      link.preferredFrameRateRange = CAFrameRateRange(minimum: 20, maximum: 30, preferred: 30)
      link.add(to: .main, forMode: .common)
      self.link = link
      lastTick = 0
    } else {
      link?.invalidate()
      link = nil
    }
  }

  fileprivate func tick(_ link: CADisplayLink) {
    // A long gap (a pause, a stall) doesn't jump the field forward.
    let delta = lastTick == 0 ? 1.0 / 30 : min(link.timestamp - lastTick, 0.1)
    lastTick = link.timestamp
    if animating, !UIAccessibility.isReduceMotionEnabled { time += delta }
    if let fade = fading {
      let progress = fade.progress + delta / Self.fadeSeconds
      if progress >= 1 {
        shown = fade.to
        fading = nil
        updateRunning()
      } else {
        fading = (fade.from, fade.to, progress)
      }
    }
    draw()
  }

  /// Keeps a held field correct: the last frame stays up on its own, so it's
  /// redrawn only when something it shows changed.
  private func drawIfStill() {
    guard link == nil, needsDraw else { return }
    draw()
  }

  private var current: Frame {
    guard let fade = fading else { return shown }
    // Smoothstep: blending the pools' colors in place is a crossfade of the
    // two fields, without drawing both.
    let t = fade.progress * fade.progress * (3 - 2 * fade.progress)
    return fade.from.blended(with: fade.to, by: Float(t))
  }

  private func draw() {
    let layer = metal.metalLayer
    guard window != nil, active, hasSwatches, bounds.width > 0, bounds.height > 0,
      let pipeline = BackdropPipeline.shared.pipeline,
      let queue = BackdropPipeline.shared.queue
    else { return }
    guard inFlight.wait(timeout: .now()) == .success else {
      // The GPU is still on the last frame. A held field has no next tick to
      // catch up on, so it asks again.
      needsDraw = true
      DispatchQueue.main.asyncAfter(deadline: .now() + 1.0 / 60) { [weak self] in
        self?.drawIfStill()
      }
      return
    }
    let semaphore = inFlight
    let started = CACurrentMediaTime()
    guard let drawable = layer.nextDrawable(), let commands = queue.makeCommandBuffer() else {
      semaphore.signal()
      return
    }
    let pass = MTLRenderPassDescriptor()
    pass.colorAttachments[0].texture = drawable.texture
    pass.colorAttachments[0].loadAction = .dontCare
    pass.colorAttachments[0].storeAction = .store
    guard let encoder = commands.makeRenderCommandEncoder(descriptor: pass) else {
      semaphore.signal()
      return
    }
    let frame = current
    let uniforms = BackdropShader.Uniforms(
      time: Float(time), aspect: Float(bounds.width / bounds.height), look: look,
      colors: frame.colors, pools: frame.pools)
    BackdropShader.encode(uniforms, pipeline: pipeline, into: encoder)
    commands.present(drawable)
    commands.addCompletedHandler { buffer in
      #if DEBUG
        let gpu = buffer.gpuEndTime - buffer.gpuStartTime
        DispatchQueue.main.async {
          Self.stats.gpuSeconds += max(gpu, 0)
          Self.stats.gpuFrames += 1
        }
      #endif
      semaphore.signal()
    }
    commands.commit()
    needsDraw = false
    Self.stats.frames += 1
    Self.stats.encodeSeconds += CACurrentMediaTime() - started
  }

  /// A display link holds its target strongly; this keeps the view free to go.
  private final class WeakTick: NSObject {
    weak var view: BackdropView?
    init(_ view: BackdropView) { self.view = view }
    @objc func tick(_ link: CADisplayLink) {
      if let view { view.tick(link) } else { link.invalidate() }
    }
  }

  private final class MetalView: UIView {
    override class var layerClass: AnyClass { CAMetalLayer.self }
    var metalLayer: CAMetalLayer { layer as! CAMetalLayer }

    override init(frame: CGRect) {
      super.init(frame: frame)
      isUserInteractionEnabled = false
      metalLayer.device = BackdropPipeline.shared.device
      metalLayer.pixelFormat = BackdropPipeline.format
      metalLayer.framebufferOnly = true
      metalLayer.isOpaque = true
      metalLayer.colorspace = CGColorSpace(name: CGColorSpace.sRGB)
      metalLayer.magnificationFilter = .linear
    }

    @available(*, unavailable)
    required init?(coder: NSCoder) { fatalError() }
  }
}

/// What one frame shows, as the shader takes it.
private struct Frame: Equatable {
  var colors: [SIMD4<Float>]
  var pools: [SIMD4<Float>]

  static let empty = Frame(colors: [], pools: [])

  private init(colors: [SIMD4<Float>], pools: [SIMD4<Float>]) {
    self.colors = colors
    self.pools = pools
  }

  init(swatches: [BackdropSwatch]) {
    let shown = swatches.prefix(BackdropShader.maxSwatches)
    colors = shown.map { BackdropShader.rgba($0.color) }
    pools = shown.map { SIMD4(Float($0.x), Float($0.y), Float($0.weight), 0) }
  }

  /// Blends slot by slot; a palette with fewer colors repeats its last.
  func blended(with next: Frame, by amount: Float) -> Frame {
    guard !colors.isEmpty, !next.colors.isEmpty else { return next }
    let count = max(colors.count, next.colors.count)
    func slot(_ list: [SIMD4<Float>], _ index: Int) -> SIMD4<Float> {
      list[min(index, list.count - 1)]
    }
    return Frame(
      colors: (0..<count).map { simd_mix(slot(colors, $0), slot(next.colors, $0), SIMD4(repeating: amount)) },
      pools: (0..<count).map { simd_mix(slot(pools, $0), slot(next.pools, $0), SIMD4(repeating: amount)) })
  }
}

/// The GPU objects every backdrop shares, created once.
final class BackdropPipeline {
  static let shared = BackdropPipeline()
  static let format = MTLPixelFormat.bgra8Unorm

  let device = MTLCreateSystemDefaultDevice()
  private(set) lazy var queue = device?.makeCommandQueue()
  private(set) var pipeline: MTLRenderPipelineState?
  private var waiting: [() -> Void] = []
  private var compiling = false

  /// Calls `ready` on the main thread with the pipeline built. Metal compiles
  /// the shader's source here, so it runs off the main thread.
  func prepare(_ ready: @escaping () -> Void) {
    if pipeline != nil {
      DispatchQueue.main.async(execute: ready)
      return
    }
    waiting.append(ready)
    guard !compiling, let device else { return }
    compiling = true
    _ = queue
    DispatchQueue.global(qos: .userInitiated).async {
      let built = try? BackdropShader.makePipeline(device: device, format: Self.format)
      DispatchQueue.main.async {
        self.pipeline = built
        self.compiling = false
        let callbacks = self.waiting
        self.waiting = []
        if built != nil { callbacks.forEach { $0() } }
      }
    }
  }
}
