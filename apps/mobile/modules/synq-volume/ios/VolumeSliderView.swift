import ExpoModulesCore
import MediaPlayer
import UIKit

/// The system volume, drawn like the player's scrubber. `MPVolumeView` does
/// the real work: it follows the hardware buttons by itself, and while it's on
/// screen iOS leaves out its own volume overlay.
///
/// A touch on the thumb goes to the slider inside it. A touch anywhere else on
/// the bar drags relative to where it landed, as the scrubber does, so it
/// never jumps, and it holds the sheet still while it does.
final class VolumeSliderView: ExpoView {
  private let volumeView = ScrubberStyleVolumeView()
  private let press = UILongPressGestureRecognizer()
  private var startX: CGFloat = 0
  private var startValue: Float = 0

  /// The slider inside `MPVolumeView`, which has no public way to reach it.
  private var slider: UISlider? {
    #if targetEnvironment(simulator)
      if let standIn { return standIn }
    #endif
    return volumeView.subviews.lazy.compactMap { $0 as? UISlider }.first
  }

  #if targetEnvironment(simulator)
    /// Simulators have no system volume, and `MPVolumeView` only says "No
    /// Volume Available" there, so this stands in to check the layout and the
    /// touches. It changes nothing.
    private var standIn: UISlider?
  #endif

  required init(appContext: AppContext? = nil) {
    super.init(appContext: appContext)
    volumeView.showsRouteButton = false
    volumeView.setVolumeThumbImage(VolumeImages.thumb(diameter: 7), for: .normal)
    volumeView.setVolumeThumbImage(VolumeImages.thumb(diameter: 18), for: .highlighted)
    volumeView.setMinimumVolumeSliderImage(VolumeImages.bar(height: 4, alpha: 0.8), for: .normal)
    volumeView.setMaximumVolumeSliderImage(VolumeImages.bar(height: 4, alpha: 0.2), for: .normal)
    volumeView.setMinimumVolumeSliderImage(
      VolumeImages.bar(height: 8, alpha: 0.8), for: .highlighted)
    volumeView.setMaximumVolumeSliderImage(
      VolumeImages.bar(height: 8, alpha: 0.2), for: .highlighted)
    addSubview(volumeView)

    // No delay: the bar's touch is the bar's from the moment it lands.
    press.addTarget(self, action: #selector(dragged))
    press.minimumPressDuration = 0
    press.allowableMovement = .greatestFiniteMagnitude
    addGestureRecognizer(press)
  }

  override func layoutSubviews() {
    super.layoutSubviews()
    volumeView.frame = bounds
    #if targetEnvironment(simulator)
      installStandInIfNeeded()
      standIn?.frame = bounds
    #endif
  }

  override func gestureRecognizerShouldBegin(_ recognizer: UIGestureRecognizer) -> Bool {
    guard recognizer === press else {
      return super.gestureRecognizerShouldBegin(recognizer)
    }
    guard let slider else { return false }
    let x = recognizer.location(in: self).x
    let thumbX = CGFloat(normalized(slider)) * bounds.width
    return abs(x - thumbX) > VolumeImages.thumbSize / 2
  }

  @objc private func dragged(_ recognizer: UILongPressGestureRecognizer) {
    guard let slider else { return }
    let x = recognizer.location(in: self).x
    switch recognizer.state {
    case .began:
      startX = x
      startValue = slider.value
      slider.isHighlighted = true
    case .changed:
      let range = slider.maximumValue - slider.minimumValue
      let moved = Float((x - startX) / max(bounds.width, 1)) * range
      slider.setValue(startValue + moved, animated: false)
      slider.sendActions(for: .valueChanged)
    default:
      slider.isHighlighted = false
    }
  }

  private func normalized(_ slider: UISlider) -> Float {
    let range = slider.maximumValue - slider.minimumValue
    return range > 0 ? (slider.value - slider.minimumValue) / range : 0
  }

  #if targetEnvironment(simulator)
    private func installStandInIfNeeded() {
      guard standIn == nil else { return }
      volumeView.isHidden = true
      let slider = StandInSlider()
      slider.value = 0.6
      slider.accessibilityLabel = "Volume (simulator stand-in)"
      slider.setThumbImage(VolumeImages.thumb(diameter: 7), for: .normal)
      slider.setThumbImage(VolumeImages.thumb(diameter: 18), for: .highlighted)
      slider.setMinimumTrackImage(VolumeImages.bar(height: 4, alpha: 0.8), for: .normal)
      slider.setMaximumTrackImage(VolumeImages.bar(height: 4, alpha: 0.2), for: .normal)
      slider.setMinimumTrackImage(VolumeImages.bar(height: 8, alpha: 0.8), for: .highlighted)
      slider.setMaximumTrackImage(VolumeImages.bar(height: 8, alpha: 0.2), for: .highlighted)
      addSubview(slider)
      standIn = slider
    }
  #endif
}

/// The slider fills the view, so its bar is centered in it, and its thumb is
/// centered on the value, so the dot reaches both ends of the bar even though
/// its image is large enough to touch.
private final class ScrubberStyleVolumeView: MPVolumeView {
  override func volumeSliderRect(forBounds bounds: CGRect) -> CGRect {
    bounds
  }

  override func volumeThumbRect(
    forBounds bounds: CGRect, volumeSliderRect rect: CGRect, value: Float
  ) -> CGRect {
    let size = VolumeImages.thumbSize
    return CGRect(
      x: rect.minX + CGFloat(value) * rect.width - size / 2,
      y: rect.midY - size / 2,
      width: size,
      height: size)
  }
}

#if targetEnvironment(simulator)
  private final class StandInSlider: UISlider {
    override func thumbRect(forBounds bounds: CGRect, trackRect rect: CGRect, value: Float)
      -> CGRect
    {
      let size = VolumeImages.thumbSize
      return CGRect(
        x: rect.minX + CGFloat(value) * rect.width - size / 2,
        y: rect.midY - size / 2,
        width: size,
        height: size)
    }
  }
#endif

private enum VolumeImages {
  /// The thumb's image, mostly clear: the dot is small, the target isn't.
  static let thumbSize: CGFloat = 44

  static func thumb(diameter: CGFloat) -> UIImage {
    let size = CGSize(width: thumbSize, height: thumbSize)
    return UIGraphicsImageRenderer(size: size).image { context in
      UIColor.white.setFill()
      context.cgContext.fillEllipse(
        in: CGRect(
          x: (thumbSize - diameter) / 2,
          y: (thumbSize - diameter) / 2,
          width: diameter,
          height: diameter))
    }
  }

  /// A capsule that stretches in the middle.
  static func bar(height: CGFloat, alpha: CGFloat) -> UIImage {
    let cap = height / 2
    let size = CGSize(width: height + 1, height: height)
    let image = UIGraphicsImageRenderer(size: size).image { _ in
      UIColor.white.withAlphaComponent(alpha).setFill()
      UIBezierPath(roundedRect: CGRect(origin: .zero, size: size), cornerRadius: cap).fill()
    }
    return image.resizableImage(
      withCapInsets: UIEdgeInsets(top: 0, left: cap, bottom: 0, right: cap),
      resizingMode: .stretch)
  }
}
