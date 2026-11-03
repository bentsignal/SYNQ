import ExpoModulesCore
import UIKit

/// Two nested capsules with no thumb, which grow while dragged, the same way
/// for the player's timeline and its volume. Each is real geometry rather than
/// a stretched view, so the ends stay round at every height, and Core Animation
/// runs the growth by itself.
///
/// The drag is relative, so touching never jumps, and it's the bar's from the
/// moment it lands, which holds the sheet still under it. Subclasses say what a
/// drag means.
class BarSliderView: ExpoView {
  static let restingHeight: CGFloat = 7
  static let grownHeight: CGFloat = 14
  static let growDuration: CFTimeInterval = 0.2
  private static let trackAlpha: CGFloat = 0.2
  private static let fillAlpha: CGFloat = 0.8

  private let track = CALayer()
  private let fill = CALayer()
  private let press = UILongPressGestureRecognizer()
  private var startX: CGFloat = 0
  private var startFraction: CGFloat = 0
  private var grown = false

  /// Where the fill ends, from 0 to 1.
  private(set) var fraction: CGFloat = 0
  var isDragging: Bool { press.state == .began || press.state == .changed }

  var dragEnabled = true {
    didSet { press.isEnabled = dragEnabled }
  }

  required init(appContext: AppContext? = nil) {
    super.init(appContext: appContext)
    track.backgroundColor = UIColor.white.withAlphaComponent(Self.trackAlpha).cgColor
    track.masksToBounds = true
    fill.backgroundColor = UIColor.white.withAlphaComponent(Self.fillAlpha).cgColor
    // From the top left, so growing changes only its bounds, and a drag's
    // moves to `position` never meet an animation of the same property.
    fill.anchorPoint = .zero
    track.addSublayer(fill)
    layer.addSublayer(track)

    press.addTarget(self, action: #selector(pressed))
    press.minimumPressDuration = 0
    press.allowableMovement = .greatestFiniteMagnitude
    addGestureRecognizer(press)

    isAccessibilityElement = true
    accessibilityTraits = .adjustable
  }

  override func layoutSubviews() {
    super.layoutSubviews()
    CATransaction.begin()
    CATransaction.setDisableActions(true)
    track.position = CGPoint(x: bounds.midX, y: bounds.midY)
    applyHeight()
    placeFill()
    CATransaction.commit()
  }

  /// Moves the fill, unless a finger is holding it.
  func show(fraction next: CGFloat, animated: Bool = false) {
    guard !isDragging else { return }
    setFraction(next, animated: animated)
  }

  private func setFraction(_ next: CGFloat, animated: Bool) {
    let clamped = min(max(next, 0), 1)
    guard clamped != fraction else { return }
    fraction = clamped
    CATransaction.begin()
    CATransaction.setDisableActions(!animated)
    CATransaction.setAnimationDuration(Self.growDuration)
    placeFill()
    CATransaction.commit()
  }

  private func applyHeight() {
    let height = grown ? Self.grownHeight : Self.restingHeight
    let size = CGRect(x: 0, y: 0, width: bounds.width, height: height)
    track.bounds = size
    track.cornerRadius = height / 2
    fill.bounds = size
    fill.cornerRadius = height / 2
  }

  /// The fill is as long as the track and slides out of it to the left, so its
  /// leading end is cut by the track's and its trailing end stays round.
  private func placeFill() {
    fill.position = CGPoint(x: (fraction - 1) * bounds.width, y: 0)
  }

  private func grow(_ next: Bool) {
    guard next != grown else { return }
    grown = next
    CATransaction.begin()
    CATransaction.setAnimationDuration(Self.growDuration)
    CATransaction.setAnimationTimingFunction(CAMediaTimingFunction(name: .easeOut))
    applyHeight()
    CATransaction.commit()
    didGrow(next)
  }

  @objc private func pressed(_ recognizer: UILongPressGestureRecognizer) {
    let x = recognizer.location(in: self).x
    switch recognizer.state {
    case .began:
      startX = x
      startFraction = dragStart()
      setFraction(startFraction, animated: false)
      grow(true)
      dragBegan()
    case .changed:
      setFraction(startFraction + (x - startX) / max(bounds.width, 1), animated: false)
      dragChanged()
    case .ended:
      grow(false)
      dragEnded()
    default:
      grow(false)
      dragCancelled()
    }
  }

  /// The bar has started growing or shrinking back.
  func didGrow(_ grown: Bool) {}
  /// Where a drag starts from.
  func dragStart() -> CGFloat { fraction }
  func dragBegan() {}
  func dragChanged() {}
  func dragEnded() {}
  func dragCancelled() {}
}
