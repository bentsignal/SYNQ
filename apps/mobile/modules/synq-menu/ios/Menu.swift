import UIKit

/// One menu item as JavaScript sends it (`menuJson` in `src/components/menu.ts`):
/// an action with an `id`, or a submenu with `children`.
struct MenuItemData: Decodable {
  let id: String
  let title: String
  let image: String?
  let destructive: Bool?
  let children: [MenuItemData]?
}

enum Menu {
  /// The groups as inline sections, so iOS draws separators between them.
  /// `select` runs with the chosen action's `id`.
  static func elements(json: String, select: @escaping (String) -> Void) -> [UIMenuElement] {
    guard let data = json.data(using: .utf8),
      let groups = try? JSONDecoder().decode([[MenuItemData]].self, from: data)
    else { return [] }
    return groups.map { group in
      UIMenu(options: .displayInline, children: group.map { element($0, select: select) })
    }
  }

  private static func element(_ item: MenuItemData, select: @escaping (String) -> Void)
    -> UIMenuElement
  {
    let image = item.image.flatMap { UIImage(systemName: $0) }
    if let children = item.children {
      return UIMenu(
        title: item.title, image: image, children: children.map { element($0, select: select) })
    }
    let id = item.id
    return UIAction(
      title: item.title, image: image,
      attributes: item.destructive == true ? .destructive : []
    ) { _ in select(id) }
  }
}
