import ExpoModulesCore
import MediaPlayer
import UIKit

/// The system volume. `MPVolumeView` does the real work and draws nothing here
/// (every image is clear): being on screen is what makes iOS leave out its own
/// overlay, and its slider is the one way to set the volume. The bar follows
/// that slider, which follows the hardware buttons.
final class VolumeSliderView: BarSliderView {
  /// How often the bar looks at the slider, which reports the hardware buttons
  /// to no one. Often enough to feel attached, and only while on screen.
  private static let followInterval: TimeInterval = 0.1
  private static let step: Float = 1 / 16

  private let volumeView = VolumeView()
  private var followTimer: Timer?

  #if targetEnvironment(simulator)
    /// Simulators have no system volume, and `MPVolumeView` only says "No
    /// Volume Available" there, so this stands in for the bar's touches.
    private let standIn: UISlider = {
      let slider = UISlider()
      slider.value = 0.6
      return slider
    }()
  #endif

  /// The slider inside `MPVolumeView`, which has no public way to reach it.
  private var slider: UISlider? {
    #if targetEnvironment(simulator)
      return standIn
    #else
      return volumeView.subviews.lazy.compactMap { $0 as? UISlider }.first
    #endif
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
    #if targetEnvironment(simulator)
      volumeView.isHidden = true
    #endif
    addSubview(volumeView)
    accessibilityLabel = "Volume"
  }

  override func layoutSubviews() {
    super.layoutSubviews()
    volumeView.frame = bounds
    follow(animated: false)
  }

  override func didMoveToWindow() {
    super.didMoveToWindow()
    followTimer?.invalidate()
    followTimer = nil
    guard window != nil else { return }
    follow(animated: false)
    let timer = Timer(timeInterval: Self.followInterval, repeats: true) { [weak self] _ in
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
    get { "\(Int((fraction * 100).rounded()))%" }
    set {}
  }

  override func accessibilityIncrement() {
    setVolume(fraction: min(Float(fraction) + Self.step, 1))
    follow(animated: true)
  }

  override func accessibilityDecrement() {
    setVolume(fraction: max(Float(fraction) - Self.step, 0))
    follow(animated: true)
  }
}

/// Fills the view, with clear images that never need a usable size.
private final class VolumeView: MPVolumeView {
  override func volumeSliderRect(forBounds bounds: CGRect) -> CGRect {
    bounds
  }
}
