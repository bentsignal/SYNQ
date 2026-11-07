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
  /// The track's opacity under a notice, on top of its own alpha.
  private static let noticeTrackOpacity: Float = 0.5
  /// The space between the notice and each part of the track.
  private static let noticeGap: CGFloat = 8
  /// The shortest a part of the track gets beside a long notice.
  private static let noticeMinSegment: CGFloat = 24
  /// The player's muted text (`--color-muted`), at its caption size.
  private static let noticeColor = UIColor(red: 235 / 255, green: 235 / 255, blue: 245 / 255, alpha: 0.6)
  private static let noticeFont = UIFont.systemFont(ofSize: 12)

  private let track = CALayer()
  private let fill = CALayer()
  private let press = UILongPressGestureRecognizer()
  private let noticeLabel = UILabel()
  /// Cuts the track in two around the notice.
  private let trackMask = CAShapeLayer()
  private var startX: CGFloat = 0
  private var startFraction: CGFloat = 0
  private var grown = false

  /// Where the fill ends, from 0 to 1.
  private(set) var fraction: CGFloat = 0
  var isDragging: Bool { press.state == .began || press.state == .changed }

  var dragEnabled = true {
    didSet { updatePressEnabled() }
  }

  /// Text that stands in for the bar when it can't be used: the fill goes, the
  /// track dims and parts around the text, and dragging stops.
  private(set) var notice: String?

  func setNotice(_ next: String?, animated: Bool) {
    guard next != notice else { return }
    notice = next
    if let next { noticeLabel.text = next }
    updatePressEnabled()
    let shown = next != nil
    CATransaction.begin()
    CATransaction.setDisableActions(!animated)
    CATransaction.setAnimationDuration(Self.growDuration)
    // The track stays parted until the notice has faded out of its gap.
    CATransaction.setCompletionBlock { [weak self] in
      if let self, self.notice == nil { self.track.mask = nil }
    }
    fill.opacity = shown ? 0 : 1
    track.opacity = shown ? Self.noticeTrackOpacity : 1
    applyHeight()
    CATransaction.commit()
    let alpha: CGFloat = shown ? 1 : 0
    if animated {
      UIView.animate(withDuration: Self.growDuration) { self.noticeLabel.alpha = alpha }
    } else {
      noticeLabel.alpha = alpha
    }
  }

  private func updatePressEnabled() {
    press.isEnabled = dragEnabled && notice == nil
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

    noticeLabel.font = Self.noticeFont
    noticeLabel.textColor = Self.noticeColor
    noticeLabel.textAlignment = .center
    noticeLabel.lineBreakMode = .byTruncatingTail
    noticeLabel.alpha = 0
    noticeLabel.isAccessibilityElement = false
    addSubview(noticeLabel)

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
    placeNotice(trackHeight: height)
  }

  /// Centers the notice on the track, and while there is one, masks the track
  /// to two capsules with a gap for it.
  private func placeNotice(trackHeight height: CGFloat) {
    guard notice != nil else { return }
    let maxWidth = max(bounds.width - 2 * (Self.noticeGap + Self.noticeMinSegment), 0)
    let size = noticeLabel.sizeThatFits(CGSize(width: maxWidth, height: .greatestFiniteMagnitude))
    let width = min(ceil(size.width), maxWidth)
    noticeLabel.frame = CGRect(
      x: bounds.midX - width / 2,
      y: bounds.midY - ceil(size.height) / 2,
      width: width,
      height: ceil(size.height)
    )
    let segment = max((bounds.width - width) / 2 - Self.noticeGap, 0)
    let path = UIBezierPath(
      roundedRect: CGRect(x: 0, y: 0, width: segment, height: height),
      cornerRadius: height / 2
    )
    path.append(
      UIBezierPath(
        roundedRect: CGRect(x: bounds.width - segment, y: 0, width: segment, height: height),
        cornerRadius: height / 2
      )
    )
    CATransaction.begin()
    CATransaction.setDisableActions(true)
    trackMask.frame = CGRect(x: 0, y: 0, width: bounds.width, height: height)
    trackMask.path = path.cgPath
    track.mask = trackMask
    CATransaction.commit()
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
