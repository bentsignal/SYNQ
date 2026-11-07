import AVFoundation
import ExpoModulesCore
import MediaPlayer
import UIKit

/// The system volume. `MPVolumeView` does the real work and draws nothing here
/// (every image is clear): being on screen is what makes iOS leave out its own
/// overlay, and its slider is the one way to set the volume. The bar follows
/// that slider, which follows the hardware buttons.
///
/// A route that sets its own volume (CarPlay, some AirPlay speakers) has no
/// slider: `MPVolumeView` shows the route's name instead, in white text that
/// would sit on the bar. That text is hidden here, and the bar shows the name
/// itself as a notice, dimmed and parted around it.
final class VolumeSliderView: BarSliderView {
  /// How often the bar looks at the slider, which reports the hardware buttons
  /// to no one. Often enough to feel attached, and only while on screen.
  private static let followInterval: TimeInterval = 0.1
  private static let step: Float = 1 / 16

  private let volumeView = VolumeView()
  private var followTimer: Timer?
  /// Whether the route has no volume to set, for JavaScript's speaker icons.
  let onAvailabilityChange = EventDispatcher()

  #if targetEnvironment(simulator)
    /// Simulators have no system volume, and `MPVolumeView` only says "No
    /// Volume Available" there, so this stands in for the bar's touches.
    private let standIn: UISlider = {
      let slider = UISlider()
      slider.value = 0.6
      return slider
    }()

    /// Uses the real `MPVolumeView` instead, which on a simulator is in the
    /// state CarPlay puts it in, to check the notice:
    /// `defaults write com.directedbyshawn.synq.dev SynqSimulatorSystemVolume -bool YES`.
    private static let usesSystemVolume = UserDefaults.standard.bool(
      forKey: "SynqSimulatorSystemVolume")
  #endif

  private var usesStandIn: Bool {
    #if targetEnvironment(simulator)
      return !Self.usesSystemVolume
    #else
      return false
    #endif
  }

  /// The slider inside `MPVolumeView`, which has no public way to reach it.
  private var slider: UISlider? {
    #if targetEnvironment(simulator)
      if usesStandIn { return standIn }
    #endif
    return volumeView.subviews.lazy.compactMap { $0 as? UISlider }.first
  }

  required init(appContext: AppContext? = nil) {
    super.init(appContext: appContext)
    volumeView.showsRouteButton = false
    let clear = UIGraphicsImageRenderer(size: CGSize(width: 1, height: 1)).image { _ in }
    volumeView.setVolumeThumbImage(clear, for: .normal)
    volumeView.setMinimumVolumeSliderImage(clear, for: .normal)
    volumeView.setMaximumVolumeSliderImage(clear, for: .normal)
    volumeView.isUserInteractionEnabled = false
    volumeView.accessibilityElementsHidden = true
    volumeView.isHidden = usesStandIn
    volumeView.didLayout = { [weak self] in self?.checkRoute(animated: true) }
    addSubview(volumeView)
    accessibilityLabel = "Volume"
  }

  override func layoutSubviews() {
    super.layoutSubviews()
    volumeView.frame = bounds
    checkRoute(animated: false)
    follow(animated: false)
  }

  override func didMoveToWindow() {
    super.didMoveToWindow()
    followTimer?.invalidate()
    followTimer = nil
    guard window != nil else { return }
    checkRoute(animated: false)
    follow(animated: false)
    let timer = Timer(timeInterval: Self.followInterval, repeats: true) { [weak self] _ in
      self?.checkRoute(animated: true)
      self?.follow(animated: true)
    }
    timer.tolerance = Self.followInterval / 2
    RunLoop.main.add(timer, forMode: .common)
    followTimer = timer
  }

  private func follow(animated: Bool) {
    guard let slider else { return }
    show(fraction: CGFloat(normalized(slider)), animated: animated)
  }

  /// Hides `MPVolumeView`'s route name, and shows it on the bar while the
  /// route has no volume to set: when its name is up or its slider is hidden.
  private func checkRoute(animated: Bool) {
    guard !usesStandIn, window != nil else { return }
    let labels = volumeView.descendants(of: UILabel.self)
    let shown = labels.first { isShown($0) && !($0.text ?? "").isEmpty }
    let name = shown?.text
    for label in labels where label.textColor != .clear {
      label.textColor = .clear
    }
    // No slider yet is a view still being built, not a route without volume.
    let sliderHidden = slider.map { !isShown($0) || !$0.isEnabled } ?? false
    let next: String? =
      name == nil && !sliderHidden
      ? nil
      : name ?? AVAudioSession.sharedInstance().currentRoute.outputs.first?.portName ?? ""
    guard next != notice else { return }
    let wasAvailable = notice == nil
    setNotice(next, animated: animated)
    accessibilityTraits = next == nil ? .adjustable : .notEnabled
    if wasAvailable != (next == nil) {
      onAvailabilityChange(["available": next == nil])
    }
  }

  /// Whether `MPVolumeView` shows the view: it hides them, or fades them out.
  private func isShown(_ view: UIView) -> Bool {
    var current: UIView? = view
    while let candidate = current, candidate !== volumeView {
      if candidate.isHidden || candidate.alpha < 0.01 { return false }
      current = candidate.superview
    }
    return true
  }

  private func normalized(_ slider: UISlider) -> Float {
    let range = slider.maximumValue - slider.minimumValue
    return range > 0 ? (slider.value - slider.minimumValue) / range : 0
  }

  private func setVolume(fraction: Float) {
    guard let slider else { return }
    let range = slider.maximumValue - slider.minimumValue
    slider.setValue(slider.minimumValue + fraction * range, animated: false)
    slider.sendActions(for: .valueChanged)
  }

  override func dragBegan() {
    slider?.isHighlighted = true
  }

  override func dragChanged() {
    setVolume(fraction: Float(fraction))
  }

  override func dragEnded() {
    slider?.isHighlighted = false
    slider?.sendActions(for: .touchUpInside)
  }

  override func dragCancelled() {
    slider?.isHighlighted = false
  }

  override var accessibilityValue: String? {
    get { notice ?? "\(Int((fraction * 100).rounded()))%" }
    set {}
  }

  override func accessibilityIncrement() {
    guard notice == nil else { return }
    setVolume(fraction: min(Float(fraction) + Self.step, 1))
    follow(animated: true)
  }

  override func accessibilityDecrement() {
    guard notice == nil else { return }
    setVolume(fraction: max(Float(fraction) - Self.step, 0))
    follow(animated: true)
  }
}

/// Fills the view, with clear images that never need a usable size.
private final class VolumeView: MPVolumeView {
  /// Runs after each layout, so a route name `MPVolumeView` has just put up is
  /// hidden before it draws.
  var didLayout: (() -> Void)?

  override func volumeSliderRect(forBounds bounds: CGRect) -> CGRect {
    bounds
  }

  override func layoutSubviews() {
    super.layoutSubviews()
    didLayout?()
  }
}

extension UIView {
  fileprivate func descendants<T: UIView>(of type: T.Type) -> [T] {
    subviews.flatMap { view -> [T] in
      if let match = view as? T { return [match] }
      return view.descendants(of: type)
    }
  }
}
