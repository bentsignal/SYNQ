import ExpoModulesCore

/// SYNQ's menu row: a React Native row with a native context menu on long
/// press and an `ellipsis` menu button, drawn with UIKit so a list of
/// thousands stays cheap to scroll. JavaScript: `src/components/native-row.tsx`.
public class SynqMenuModule: Module {
  public func definition() -> ModuleDefinition {
    Name("SynqMenu")

    View(MenuRowView.self) {
      Events("onRowPress", "onRowMenuAction")

      Prop("menu") { (view: MenuRowView, json: String) in
        view.menuJSON = json
      }
      Prop("label") { (view: MenuRowView, label: String) in
        view.label = label
      }
      Prop("buttonWidth") { (view: MenuRowView, width: Double) in
        view.buttonWidth = width
      }
      Prop("buttonColor") { (view: MenuRowView, color: UIColor?) in
        view.buttonColor = color
      }
      Prop("rowColor") { (view: MenuRowView, color: UIColor?) in
        view.rowColor = color
      }
      Prop("highlightColor") { (view: MenuRowView, color: UIColor?) in
        view.highlightColor = color
      }
    }
  }
}
