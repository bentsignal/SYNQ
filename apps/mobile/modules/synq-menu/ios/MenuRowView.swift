import ExpoModulesCore
import UIKit

/// A list row: React Native draws its look, and UIKit handles the touch.
/// A tap flashes the row's highlight and sends `onRowPress`; a long press lifts
/// its content into a context menu; the trailing `ellipsis` button opens the
/// same menu.
///
/// It replaces a SwiftUI `Host` per row (`ContextMenu`, `Button`, `Menu`),
/// which made flings through thousands of songs drop frames. Nothing here
/// is built until it's needed: the menu arrives as a JSON string and is
/// parsed only when a menu opens, so a recycled row's new props cost a
/// string comparison.
final class MenuRowView: ExpoView, UIContextMenuInteractionDelegate {
  let onRowPress = EventDispatcher()
  let onRowMenuAction = EventDispatcher()

  var menuJSON = ""
  var label = "" {
    didSet { content.accessibilityLabel = label }
  }
  var buttonWidth: Double = 44 {
    didSet {
      button.isHidden = buttonWidth <= 0
      setNeedsLayout()
    }
  }
  var buttonColor: UIColor? {
    didSet { button.tintColor = buttonColor }
  }
  /// What a finished tap flashes behind the row; nil (a card) flashes nothing.
  /// Only a finished tap: a touch that's still down may become a long press,
  /// which must lift with nothing gray behind it. The rest of the time the row
  /// is clear, so a neighbor overlapping it by a fraction of a point never
  /// covers its hairline separator.
  var highlightColor: UIColor?
  /// The corners of the shape a long press lifts.
  var previewRadius: CGFloat = 12

  /// Holds the React Native row, under the button. It takes no touches
  /// itself, so they land on this view.
  private let content = RowContent()
  private let button = UIButton(type: .system)

  private var touching = false
  private var focusBackdrop: FocusBackdrop?
  /// What's frontmost in the window before the menu's own views arrive.
  private weak var focusHost: UIView?

  required init(appContext: AppContext? = nil) {
    super.init(appContext: appContext)
    content.isUserInteractionEnabled = false
    content.isAccessibilityElement = true
    content.accessibilityTraits = .button
    content.activate = { [weak self] in self?.onRowPress() }
    addSubview(content)

    button.setImage(
      UIImage(
        systemName: "ellipsis",
        withConfiguration: UIImage.SymbolConfiguration(pointSize: 17, weight: .regular)),
      for: .normal)
    button.showsMenuAsPrimaryAction = true
    button.accessibilityLabel = "More"
    // Built when it opens, from the props of the moment.
    button.menu = UIMenu(children: [
      UIDeferredMenuElement.uncached { [weak self] completion in
        completion(self?.menuElements() ?? [])
      }
    ])
    addSubview(button)

    addInteraction(UIContextMenuInteraction(delegate: self))
  }

  // MARK: - React Native children

  override func mountChildComponentView(_ childComponentView: UIView, index: Int) {
    content.insertSubview(childComponentView, at: index)
  }

  override func unmountChildComponentView(_ childComponentView: UIView, index: Int) {
    childComponentView.removeFromSuperview()
  }

  override func layoutSubviews() {
    super.layoutSubviews()
    content.frame = bounds
    let width = CGFloat(max(buttonWidth, 0))
    button.frame = CGRect(x: bounds.width - width, y: 0, width: width, height: bounds.height)
  }

  // MARK: - Tap

  override func touchesBegan(_ touches: Set<UITouch>, with event: UIEvent?) {
    // A touch that stops a fling only stops it, as in a table view.
    touching = !enclosingScrollViewIsMoving()
  }

  override func touchesMoved(_ touches: Set<UITouch>, with event: UIEvent?) {
    guard touching, let touch = touches.first else { return }
    if !bounds.insetBy(dx: -20, dy: -20).contains(touch.location(in: self)) {
      touching = false
    }
  }

  override func touchesEnded(_ touches: Set<UITouch>, with event: UIEvent?) {
    guard touching else { return }
    touching = false
    content.backgroundColor = highlightColor
    onRowPress()
    UIView.animate(withDuration: 0.3, delay: 0.05, options: [.allowUserInteraction]) {
      self.content.backgroundColor = .clear
    }
  }

  override func touchesCancelled(_ touches: Set<UITouch>, with event: UIEvent?) {
    touching = false
  }

  private func enclosingScrollViewIsMoving() -> Bool {
    var view = superview
    while let current = view {
      if let scrollView = current as? UIScrollView {
        return scrollView.isDecelerating || scrollView.isDragging
      }
      view = current.superview
    }
    return false
  }

  // MARK: - Menus

  private func menuElements() -> [UIMenuElement] {
    Menu.elements(json: menuJSON) { [weak self] id in
      self?.onRowMenuAction(["id": id])
    }
  }

  func contextMenuInteraction(
    _ interaction: UIContextMenuInteraction,
    configurationForMenuAtLocation location: CGPoint
  ) -> UIContextMenuConfiguration? {
    if menuJSON.isEmpty { return nil }
    // The lift is the long press's feedback, and the tap no longer counts.
    touching = false
    focusHost = window?.subviews.last
    // An identifier, so iOS asks for the highlight and dismissal previews.
    return UIContextMenuConfiguration(identifier: "row" as NSString, previewProvider: nil) {
      [weak self] _ in
      UIMenu(children: self?.menuElements() ?? [])
    }
  }

  func contextMenuInteraction(
    _ interaction: UIContextMenuInteraction,
    willDisplayMenuFor configuration: UIContextMenuConfiguration,
    animator: (any UIContextMenuInteractionAnimating)?
  ) {
    focusBackdrop?.hide(alongside: nil)
    focusBackdrop = focusHost.flatMap { FocusBackdrop(on: $0) }
    focusBackdrop?.show(alongside: animator)
  }

  func contextMenuInteraction(
    _ interaction: UIContextMenuInteraction,
    willEndFor configuration: UIContextMenuConfiguration,
    animator: (any UIContextMenuInteractionAnimating)?
  ) {
    focusBackdrop?.hide(alongside: animator)
    focusBackdrop = nil
  }

  func contextMenuInteraction(
    _ interaction: UIContextMenuInteraction,
    configuration: UIContextMenuConfiguration,
    highlightPreviewForItemWithIdentifier identifier: any NSCopying
  ) -> UITargetedPreview? {
    preview()
  }

  func contextMenuInteraction(
    _ interaction: UIContextMenuInteraction,
    configuration: UIContextMenuConfiguration,
    dismissalPreviewForItemWithIdentifier identifier: any NSCopying
  ) -> UITargetedPreview? {
    preview()
  }

  /// The content itself lifted. Clear, or iOS fills the shape with its own gray.
  private func preview() -> UITargetedPreview? {
    guard window != nil else { return nil }
    let parameters = UIPreviewParameters()
    parameters.backgroundColor = .clear
    parameters.visiblePath = UIBezierPath(roundedRect: bounds, cornerRadius: previewRadius)
    return UITargetedPreview(view: self, parameters: parameters)
  }
}

/// The row's React Native look, read by VoiceOver as one button.
private final class RowContent: UIView {
  var activate: (() -> Void)?

  override func accessibilityActivate() -> Bool {
    activate?()
    return true
  }
}
