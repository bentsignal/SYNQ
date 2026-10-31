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

/**
 * Runs a menu action once the menu has closed, so the change it makes (a
 * row leaving the list, a sheet opening) doesn't interrupt the menu's own
 * closing animation (Vera's `afterMenuCloses`).
 */
export function afterMenuCloses(action: () => void) {
  setTimeout(action, 300);
}
