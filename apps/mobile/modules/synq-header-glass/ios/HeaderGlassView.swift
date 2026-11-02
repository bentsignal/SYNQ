import ExpoModulesCore
import UIKit

/// The glass behind a root tab's navigation bar, ending in a faint line, which
/// fades in as soon as the page has scrolled and out when it's back at the top.
///
/// iOS's own scroll edge effect cuts in and out, and can't be animated. So this
/// takes its place: it fills the screen on top of the page, passes every touch
/// through, draws only over the top safe area (which includes the bar), and
/// watches the page's scroll view itself, so scrolling costs no JavaScript
/// and it works the same over a SwiftUI form.
final class HeaderGlassView: ExpoView {
  private static let fadeDuration: TimeInterval = 0.25
  /// Past the top by more than rounding, in points.
  private static let scrolledPast: CGFloat = 0.5
  /// A page's scroll view can arrive after this view, or be replaced.
  private static let searchInterval: TimeInterval = 0.25

  private let glass = UIVisualEffectView(effect: nil)
  private let hairline = UIView()
  private var scrollView: UIScrollView?
  private var observation: NSKeyValueObservation?
  private var searchTimer: Timer?
  private var scrolled = false

  required init(appContext: AppContext? = nil) {
    super.init(appContext: appContext)
    isUserInteractionEnabled = false
    isAccessibilityElement = false
    hairline.backgroundColor = UIColor.white.withAlphaComponent(0.12)
    hairline.alpha = 0
    addSubview(glass)
    addSubview(hairline)
  }

  override func hitTest(_ point: CGPoint, with event: UIEvent?) -> UIView? {
    nil
  }

  override func layoutSubviews() {
    super.layoutSubviews()
    let height = safeAreaInsets.top
    glass.frame = CGRect(x: 0, y: 0, width: bounds.width, height: height)
    let line = 1 / max(traitCollection.displayScale, 1)
    hairline.frame = CGRect(x: 0, y: height - line, width: bounds.width, height: line)
  }

  override func safeAreaInsetsDidChange() {
    super.safeAreaInsetsDidChange()
    setNeedsLayout()
  }

  override func didMoveToWindow() {
    super.didMoveToWindow()
    searchTimer?.invalidate()
    searchTimer = nil
    guard window != nil else { return }
    attach()
    let timer = Timer(timeInterval: Self.searchInterval, repeats: true) { [weak self] _ in
      self?.attach()
    }
    timer.tolerance = Self.searchInterval / 2
    RunLoop.main.add(timer, forMode: .common)
    searchTimer = timer
  }

  /// Watches the page's scroll view, if that isn't already the one it has.
  private func attach() {
    if let scrollView, scrollView.window != nil { return }
    guard let found = findScrollView() else { return }
    scrollView = found
    if #available(iOS 26.0, *) {
      found.topEdgeEffect.isHidden = true
    }
    observation = found.observe(\.contentOffset, options: [.initial, .new]) {
      [weak self] scrollView, _ in
      MainActor.assumeIsolated { self?.update(scrollView) }
    }
  }

  /// The first scroll view among this view's siblings, breadth first, so an
  /// outer one wins over any inside its rows.
  private func findScrollView() -> UIScrollView? {
    var level = (superview?.subviews ?? []).filter { $0 !== self }
    while !level.isEmpty {
      if let found = level.lazy.compactMap({ $0 as? UIScrollView }).first { return found }
      level = level.flatMap(\.subviews)
    }
    return nil
  }

  private func update(_ scrollView: UIScrollView) {
    let top = scrollView.contentOffset.y + scrollView.adjustedContentInset.top
    let next = top > Self.scrolledPast
    guard next != scrolled else { return }
    scrolled = next
    UIView.animate(
      withDuration: Self.fadeDuration, delay: 0, options: [.beginFromCurrentState, .curveEaseInOut]
    ) {
      self.glass.effect = next ? UIBlurEffect(style: .systemUltraThinMaterialDark) : nil
      self.hairline.alpha = next ? 1 : 0
    }
  }
}
