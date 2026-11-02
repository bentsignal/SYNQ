import ExpoModulesCore
import UIKit

/// The player's timeline. JavaScript gives it the position and says what a seek
/// means; while a finger is on it, the bar is the finger's. `onScrub` fires when
/// the dragged position reaches a new whole second, for the time labels, not on
/// every move.
final class ScrubberView: BarSliderView {
  private static let accessibilityStep: CGFloat = 0.05

  let onScrub = EventDispatcher()
  let onSeek = EventDispatcher()

  var durationSeconds: Double = 0
  var valueText = ""

  private var lastSecond = -1

  required init(appContext: AppContext? = nil) {
    super.init(appContext: appContext)
    accessibilityLabel = "Position"
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
