import ExpoModulesCore
import UIKit

/// An `ellipsis` `UIButton` that opens a menu, the same as a list row's, with
/// the dots centered. All of its bounds and `touchOutset` around them take the
/// touch. SwiftUI's `Menu` only takes touches on its label, which for three dots
/// is a target about 22 × 6 pt however large its frame is.
///
/// With `circleColor`, the button itself is that circle, so iOS turns all of it
/// into the menu and back rather than only the dots.
final class MenuButtonView: ExpoView {
  let onMenuAction = EventDispatcher()

  var menuJSON = ""
  var color: UIColor? {
    didSet { updateAppearance() }
  }
  var circleColor: UIColor? {
    didSet { updateAppearance() }
  }
  var touchOutset: CGSize = .zero {
    didSet { button.touchOutset = touchOutset }
  }

  private let button = OutsetButton(type: .system)

  required init(appContext: AppContext? = nil) {
    super.init(appContext: appContext)
    updateAppearance()
    button.showsMenuAsPrimaryAction = true
    button.accessibilityLabel = "More"
    // Built when it opens, from the props of the moment.
    button.menu = UIMenu(children: [
      UIDeferredMenuElement.uncached { [weak self] completion in
        guard let self else { return completion([]) }
        completion(
          Menu.elements(json: self.menuJSON) { [weak self] id in
            self?.onMenuAction(["id": id])
          })
      }
    ])
    addSubview(button)
  }

  override func layoutSubviews() {
    super.layoutSubviews()
    button.frame = bounds
  }

  override func point(inside point: CGPoint, with event: UIEvent?) -> Bool {
    button.frame.insetBy(dx: -touchOutset.width, dy: -touchOutset.height).contains(point)
  }

  private func updateAppearance() {
    var configuration = UIButton.Configuration.plain()
    configuration.image = UIImage(systemName: "ellipsis")
    configuration.preferredSymbolConfigurationForImage = UIImage.SymbolConfiguration(
      pointSize: 15, weight: .regular)
    configuration.baseForegroundColor = color ?? .white
    configuration.contentInsets = .zero
    if let circleColor {
      configuration.background.backgroundColor = circleColor
      configuration.cornerStyle = .capsule
    }
    button.configuration = configuration
  }
}

/// Takes touches a little past its bounds, and lifts all of itself into its menu.
private final class OutsetButton: UIButton {
  var touchOutset: CGSize = .zero

  override func point(inside point: CGPoint, with event: UIEvent?) -> Bool {
    bounds.insetBy(dx: -touchOutset.width, dy: -touchOutset.height).contains(point)
  }

  override func contextMenuInteraction(
    _ interaction: UIContextMenuInteraction,
    previewForHighlightingMenuWithConfiguration configuration: UIContextMenuConfiguration
  ) -> UITargetedPreview? {
    let parameters = UIPreviewParameters()
    parameters.backgroundColor = .clear
    parameters.visiblePath = UIBezierPath(ovalIn: bounds)
    return UITargetedPreview(view: self, parameters: parameters)
  }
}
