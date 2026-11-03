import UIKit

/// Dragging a row sideways: its content follows the finger and uncovers a symbol
/// at the edge it left, which turns the accent, with a tick, once letting go
/// would do the action. Letting go springs the row back, and does it past that
/// point. Only a sideways drag takes the touch, so the list still scrolls, and
/// one to the right that starts in the left fifth stays iOS's own Back.
@MainActor
final class RowSwipe: NSObject, UIGestureRecognizerDelegate {
  private static let threshold: CGFloat = 72
  /// How much of the drag past the threshold the row follows.
  private static let pastThreshold: CGFloat = 0.25
  /// A drag to the right from this share of the row, at its left, is iOS's Back.
  private static let backEdgeShare: CGFloat = 0.2
  private static let symbolInset: CGFloat = 24
  private static let symbolSize: CGFloat = 20
  /// Sideways by at least this many times its movement up or down.
  private static let sideways: CGFloat = 1.5

  var rightSymbol: String? {
    didSet { attachIfNeeded() }
  }
  var leftSymbol: String? {
    didSet { attachIfNeeded() }
  }

  private weak var row: MenuRowView?
  private let content: [UIView]
  private let pan = UIPanGestureRecognizer()
  private var attached = false
  private var icon: UIImageView?
  private var ready = false
  /// Which edge the symbol is showing at.
  private var showingRight: Bool?

  init(row: MenuRowView, content: [UIView]) {
    self.row = row
    self.content = content
    super.init()
    pan.addTarget(self, action: #selector(panned))
    pan.delegate = self
  }

  private func attachIfNeeded() {
    guard !attached, rightSymbol != nil || leftSymbol != nil else { return }
    attached = true
    row?.addGestureRecognizer(pan)
  }

  func gestureRecognizerShouldBegin(_ recognizer: UIGestureRecognizer) -> Bool {
    guard let row else { return false }
    let velocity = pan.velocity(in: row)
    guard abs(velocity.x) > abs(velocity.y) * Self.sideways else { return false }
    let symbol = velocity.x > 0 ? rightSymbol : leftSymbol
    guard symbol != nil else { return false }
    let startX = pan.location(in: row).x - pan.translation(in: row).x
    return velocity.x < 0 || startX > row.bounds.width * Self.backEdgeShare
  }

  /// iOS's Back from anywhere on the page waits to see if this is a row's drag.
  func gestureRecognizer(
    _ recognizer: UIGestureRecognizer,
    shouldBeRequiredToFailBy other: UIGestureRecognizer
  ) -> Bool {
    isNavigationGesture(other)
  }

  /// A pan on one of the row's ancestors that isn't a scroll view's: iOS's Back.
  private func isNavigationGesture(_ recognizer: UIGestureRecognizer) -> Bool {
    guard recognizer is UIPanGestureRecognizer, let view = recognizer.view, let row else {
      return false
    }
    return !(view is UIScrollView) && row.isDescendant(of: view)
  }

  @objc private func panned(_ recognizer: UIPanGestureRecognizer) {
    guard let row else { return }
    let x = recognizer.translation(in: row).x
    switch recognizer.state {
    case .began:
      row.swipeBegan()
      ready = false
      showingRight = nil
      // The first report can have no distance in it, but it has a direction.
      move(x == 0 ? recognizer.velocity(in: row).x / 1000 : x)
    case .changed:
      move(x)
    case .ended where ready:
      let right = showingRight ?? (x > 0)
      springBack()
      row.swipeFinished(right: right)
    default:
      springBack()
    }
  }

  private func show(right: Bool) {
    guard let row, let symbol = right ? rightSymbol : leftSymbol else { return }
    let icon = self.icon ?? UIImageView()
    if self.icon == nil {
      icon.contentMode = .center
      self.icon = icon
      row.insertSubview(icon, at: 0)
    }
    icon.image = UIImage(
      systemName: symbol,
      withConfiguration: UIImage.SymbolConfiguration(pointSize: Self.symbolSize, weight: .medium))
    icon.tintColor = .secondaryLabel
    let width = Self.symbolInset * 2 + Self.symbolSize
    icon.frame = CGRect(
      x: right ? 0 : row.bounds.width - width, y: 0, width: width, height: row.bounds.height)
    icon.alpha = 0
    icon.transform = .identity
  }

  private func move(_ rawX: CGFloat) {
    guard let row else { return }
    // Back past where it started, toward a side with no action, it stays put.
    let right = rawX > 0
    let x = (right ? rightSymbol : leftSymbol) == nil ? 0 : rawX
    if x != 0, right != showingRight {
      showingRight = right
      show(right: right)
    }
    let distance = abs(x)
    let followed =
      distance <= Self.threshold
      ? distance : Self.threshold + (distance - Self.threshold) * Self.pastThreshold
    let moved = x < 0 ? -followed : followed
    for view in content { view.transform = CGAffineTransform(translationX: moved, y: 0) }
    icon?.alpha = min(distance / Self.threshold, 1)
    let nextReady = distance >= Self.threshold
    guard nextReady != ready else { return }
    ready = nextReady
    if nextReady { row.swipeReady() }
    UIView.animate(withDuration: 0.15, delay: 0, options: [.beginFromCurrentState]) { [self] in
      icon?.tintColor = nextReady ? row.swipeTint : .secondaryLabel
      icon?.transform = nextReady ? CGAffineTransform(scaleX: 1.2, y: 1.2) : .identity
    }
  }

  private func springBack() {
    ready = false
    UIView.animate(
      withDuration: 0.4, delay: 0, usingSpringWithDamping: 0.85, initialSpringVelocity: 0,
      options: [.beginFromCurrentState, .allowUserInteraction]
    ) { [self] in
      for view in content { view.transform = .identity }
      icon?.alpha = 0
      icon?.transform = .identity
    }
  }
}
