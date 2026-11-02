import ExpoModulesCore

/// The `ellipsis` button for places outside a list row. It's its own module so
/// JavaScript can tell whether a binary has it. JavaScript:
/// `src/components/menu-button.tsx`.
public class SynqMenuButtonModule: Module {
  public func definition() -> ModuleDefinition {
    Name("SynqMenuButton")

    View(MenuButtonView.self) {
      Events("onMenuAction")

      Prop("menu") { (view: MenuButtonView, json: String) in
        view.menuJSON = json
      }
      Prop("color") { (view: MenuButtonView, color: UIColor?) in
        view.color = color
      }
      Prop("trailingInset") { (view: MenuButtonView, inset: Double) in
        view.trailingInset = CGFloat(inset)
      }
    }
  }
}
