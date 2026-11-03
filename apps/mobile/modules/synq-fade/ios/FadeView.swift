import ExpoModulesCore
import UIKit

/// Clips its one child and fades it to transparent at whichever edges cut
/// something off, with a real alpha mask, since what's behind the text moves.
///
/// The child is a wide track holding the text, which React Native has already
/// measured by the time this lays out. So the first frame of a new song's
/// title is right without JavaScript measuring anything: text that fits has no
/// mask at all, and costs nothing.
///
/// `phase` says where the track is: at its start (only the trailing edge
/// fades), moving (both), or at its end (only the leading edge). It changes a
/// few times a cycle, and Core Animation runs the fade from there.
final class FadeView: ExpoView {
  /// Less overflow than this isn't worth fading; `marquee-text.tsx` doesn't
  /// move it either.
  private static let minimumOverflow: CGFloat = 2
  private static let fadeDuration: CFTimeInterval = 0.25
  private static let opaque = UIColor.black.cgColor
  private static let clear = UIColor.black.withAlphaComponent(0).cgColor

  var fadeWidth: CGFloat = 16 {
    didSet { setNeedsLayout() }
  }
  var phase = 0

  /// Wears the mask and holds the child. React Native rewrites its own view's
  /// mask whenever it redraws that view's layer, as a new `phase` can make it,
  /// which took the fade away once the text stopped.
  private let masked = UIView()
  private let gradient = CAGradientLayer()

  required init(appContext: AppContext? = nil) {
    super.init(appContext: appContext)
    masked.clipsToBounds = true
    addSubview(masked)
    gradient.startPoint = CGPoint(x: 0, y: 0.5)
    gradient.endPoint = CGPoint(x: 1, y: 0.5)
  }

  override func mountChildComponentView(_ childComponentView: UIView, index: Int) {
    masked.insertSubview(childComponentView, at: index)
  }

  override func unmountChildComponentView(_ childComponentView: UIView, index: Int) {
    childComponentView.removeFromSuperview()
  }

  override func layoutSubviews() {
    super.layoutSubviews()
    masked.frame = bounds
    CATransaction.begin()
    CATransaction.setDisableActions(true)
    gradient.frame = bounds
    if bounds.width > 0 {
      let stop = min(fadeWidth / bounds.width, 0.5)
      gradient.locations = [0, stop, 1 - stop, 1].map { NSNumber(value: Double($0)) }
    }
    CATransaction.commit()
    update(animated: false)
  }

  private var overflows: Bool {
    guard let text = masked.subviews.first?.subviews.first else { return false }
    return text.bounds.width - bounds.width >= Self.minimumOverflow
  }

  func update(animated: Bool) {
    guard overflows else {
      masked.layer.mask = nil
      return
    }
    let colors = [
      phase == 0 ? Self.opaque : Self.clear,
      Self.opaque,
      Self.opaque,
      phase == 2 ? Self.opaque : Self.clear,
    ]
    let wasMasked = masked.layer.mask != nil
    CATransaction.begin()
    CATransaction.setDisableActions(!(animated && wasMasked))
    CATransaction.setAnimationDuration(Self.fadeDuration)
    gradient.colors = colors
    CATransaction.commit()
    if !wasMasked { masked.layer.mask = gradient }
  }
}
