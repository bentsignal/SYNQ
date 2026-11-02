import ExpoModulesCore
import UIKit

/// The player's timeline. JavaScript gives it the position and says what a seek
/// means; while a finger is on it, the bar is the finger's. `onScrub` fires when
/// the dragged position reaches a new whole second, for the time labels, not on
/// every move. The time labels are its children: as the bar grows, it moves them
/// down by as much, so they stay the same distance from it.
final class ScrubberView: BarSliderView {
  private static let accessibilityStep: CGFloat = 0.05

  let onScrub = EventDispatcher()
  let onSeek = EventDispatcher()

  var durationSeconds: Double = 0
  var valueText = ""

  private var lastSecond = -1
  /// Holds React Native's children, whose own transforms are React Native's.
  private let times = UIView()

  required init(appContext: AppContext? = nil) {
    super.init(appContext: appContext)
    accessibilityLabel = "Position"
    addSubview(times)
  }

  override func mountChildComponentView(_ childComponentView: UIView, index: Int) {
    times.insertSubview(childComponentView, at: index)
  }

  override func unmountChildComponentView(_ childComponentView: UIView, index: Int) {
    childComponentView.removeFromSuperview()
  }

  override func layoutSubviews() {
    super.layoutSubviews()
    times.bounds = CGRect(origin: .zero, size: bounds.size)
    times.center = CGPoint(x: bounds.midX, y: bounds.midY)
  }

  override func didGrow(_ grown: Bool) {
    let moved = (Self.grownHeight - Self.restingHeight) / 2
    UIView.animate(
      withDuration: Self.growDuration, delay: 0,
      options: [.curveEaseOut, .beginFromCurrentState]
    ) {
      self.times.transform = grown ? CGAffineTransform(translationX: 0, y: moved) : .identity
    }
  }

  private func reportSecond() {
    let second = Int(fraction * durationSeconds)
    guard second != lastSecond else { return }
    lastSecond = second
    onScrub(["seconds": second])
  }

  override func dragBegan() {
    lastSecond = -1
    reportSecond()
  }

  override func dragChanged() {
    reportSecond()
  }

  override func dragEnded() {
    onSeek(["fraction": Double(fraction)])
  }

  override func dragCancelled() {
    onScrub(["seconds": -1])
  }

  override var accessibilityValue: String? {
    get { valueText }
    set {}
  }

  override func accessibilityIncrement() {
    guard dragEnabled else { return }
    onSeek(["fraction": Double(min(fraction + Self.accessibilityStep, 1))])
  }

  override func accessibilityDecrement() {
    guard dragEnabled else { return }
    onSeek(["fraction": Double(max(fraction - Self.accessibilityStep, 0))])
  }
}
