import type { SFSymbol } from "expo-symbols";

/** One item in a SwiftUI menu (a row's ellipsis menu or its context menu). */
export interface MenuAction {
  key: string;
  label: string;
  icon: SFSymbol;
  destructive?: boolean;
  onPress: () => void;
}

/** A submenu, such as Go to Artist when a song credits several. */
export interface MenuSubmenu {
  key: string;
  label: string;
  icon: SFSymbol;
  items: readonly MenuAction[];
}

export type MenuItem = MenuAction | MenuSubmenu;

/** A menu: groups of items, drawn with separators between them. */
export type MenuGroups = readonly (readonly MenuItem[])[];

/** The trailing `ellipsis` button's width in a row. */
export const MENU_WIDTH = 44;

/**
 * Runs a menu action once the menu has closed, so the change it makes (a
 * row leaving the list, a sheet opening) doesn't interrupt the menu's own
 * closing animation (Vera's `afterMenuCloses`).
 */
export function afterMenuCloses(action: () => void) {
  setTimeout(action, 300);
}

/** One menu item as the native menu row takes it (modules/synq-menu). */
interface NativeMenuItem {
  id: string;
  title: string;
  image: string;
  destructive?: boolean;
  children?: NativeMenuItem[];
}

/**
 * A menu as the native menu row takes it: JSON, which the row parses only
 * when a menu opens. Each action's `id` is its place in the menu
 * (`group.item`, or `group.item.subitem`), which `menuAction` reads back.
 */
export function menuJson(groups: MenuGroups) {
  const native = groups.map((group, g) =>
    group.map((item, i): NativeMenuItem => {
      const id = `${g}.${i}`;
      if ("items" in item) {
        return {
          children: item.items.map((action, a) => ({
            destructive: action.destructive,
            id: `${id}.${a}`,
            image: action.icon,
            title: action.label,
          })),
          id,
          image: item.icon,
          title: item.label,
        };
      }
      return {
        destructive: item.destructive,
        id,
        image: item.icon,
        title: item.label,
      };
    }),
  );
  return JSON.stringify(native);
}

/** The action a native menu chose, by the `id` `menuJson` gave it. */
export function menuAction(groups: MenuGroups, id: string) {
  const [g, i, a] = id.split(".").map(Number);
  if (g === undefined || i === undefined) return undefined;
  const item = groups[g]?.[i];
  if (item === undefined) return undefined;
  if ("items" in item) return a === undefined ? undefined : item.items[a];
  return a === undefined ? item : undefined;
}
