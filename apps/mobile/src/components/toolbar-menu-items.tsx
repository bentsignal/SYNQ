import { Stack } from "expo-router";

import type { MenuGroups } from "./menu";

/**
 * A menu's groups as a `Stack.Toolbar.Menu`'s items, so a page's `ellipsis`
 * offers what a long press on its row does. A plain function, not a
 * component: a toolbar menu's items must be its direct children.
 */
export function toolbarMenuItems(groups: MenuGroups) {
  return groups.map((group) => (
    <Stack.Toolbar.Menu key={group.map((item) => item.key).join(" ")} inline>
      {group.map((item) =>
        "items" in item ? (
          <Stack.Toolbar.Menu
            key={item.key}
            title={item.label}
            icon={item.icon}
          >
            {item.items.map((action) => (
              <Stack.Toolbar.MenuAction
                key={action.key}
                icon={action.icon}
                onPress={action.onPress}
              >
                {action.label}
              </Stack.Toolbar.MenuAction>
            ))}
          </Stack.Toolbar.Menu>
        ) : (
          <Stack.Toolbar.MenuAction
            key={item.key}
            icon={item.icon}
            destructive={item.destructive}
            onPress={item.onPress}
          >
            {item.label}
          </Stack.Toolbar.MenuAction>
        ),
      )}
    </Stack.Toolbar.Menu>
  ));
}
