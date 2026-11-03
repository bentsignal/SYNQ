import UIKit

/// A native alert whose destructive button stays off until a phrase is typed,
/// which `Alert` in React Native can't do. Capitals and the spaces around it
/// don't matter: the point is that nobody does this by accident.
enum TypedConfirm {
  @MainActor
  static func show(
    title: String, message: String, phrase: String, confirmTitle: String,
    finished: @escaping (Bool) -> Void
  ) {
    guard let presenter = frontmostController() else { return finished(false) }
    let alert = UIAlertController(title: title, message: message, preferredStyle: .alert)
    let confirm = UIAlertAction(title: confirmTitle, style: .destructive) { _ in finished(true) }
    confirm.isEnabled = false
    alert.addTextField { field in
      field.placeholder = phrase
      field.autocapitalizationType = .sentences
      field.autocorrectionType = .no
      field.spellCheckingType = .no
      field.returnKeyType = .done
      field.addAction(
        UIAction { [weak field, weak confirm] _ in
          confirm?.isEnabled = matches(field?.text, phrase)
        }, for: .editingChanged)
    }
    alert.addAction(UIAlertAction(title: "Cancel", style: .cancel) { _ in finished(false) })
    alert.addAction(confirm)
    presenter.present(alert, animated: true)
  }

  private static func matches(_ text: String?, _ phrase: String) -> Bool {
    (text ?? "").trimmingCharacters(in: .whitespacesAndNewlines)
      .caseInsensitiveCompare(phrase) == .orderedSame
  }

  @MainActor
  private static func frontmostController() -> UIViewController? {
    let scenes = UIApplication.shared.connectedScenes.compactMap { $0 as? UIWindowScene }
    let window = scenes.flatMap(\.windows).first(where: \.isKeyWindow)
    var controller = window?.rootViewController
    while let presented = controller?.presentedViewController { controller = presented }
    return controller
  }
}
