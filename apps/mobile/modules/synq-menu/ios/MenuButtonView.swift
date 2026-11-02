import ExpoModulesCore
import UIKit

/// An `ellipsis` `UIButton` that opens a menu, the same as a list row's. All of
/// its bounds take the touch. SwiftUI's `Menu` only takes touches on its label,
/// which for three dots is a target about 22 × 6 pt however large its frame is.
///
/// The dots sit `trailingInset` from the right edge, whatever width the symbol
/// has, so they can line up with something else on the screen while the target
/// stays large around them.
final class MenuButtonView: ExpoView {
  let onMenuAction = EventDispatcher()

  var menuJSON = ""
  var color: UIColor? {
    didSet { updateAppearance() }
  }
  var trailingInset: CGFloat = 0 {
    didSet { updateAppearance() }
  }

  private let button = UIButton(type: .system)

  required init(appContext: AppContext? = nil) {
    super.init(appContext: appContext)
    updateAppearance()
    button.contentHorizontalAlignment = .trailing
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

  private func updateAppearance() {
    var configuration = UIButton.Configuration.plain()
    configuration.image = UIImage(systemName: "ellipsis")
    configuration.preferredSymbolConfigurationForImage = UIImage.SymbolConfiguration(
      pointSize: 20, weight: .regular)
    configuration.baseForegroundColor = color ?? .white
    configuration.contentInsets = NSDirectionalEdgeInsets(
      top: 0, leading: 0, bottom: 0, trailing: trailingInset)
    button.configuration = configuration
  }
}
