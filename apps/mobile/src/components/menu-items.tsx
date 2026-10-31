import { Button, Menu, Section } from "@expo/ui/swift-ui";

import type { MenuAction, MenuGroups } from "./menu";
import { afterMenuCloses } from "./menu";

function ActionButton({ action }: { action: MenuAction }) {
  return (
    <Button
      label={action.label}
      systemImage={action.icon}
      role={action.destructive === true ? "destructive" : undefined}
      onPress={() => afterMenuCloses(action.onPress)}
    />
  );
}

/**
 * A menu's groups as SwiftUI items, for a `Menu` or `ContextMenu.Items`:
 * each group a section, so iOS draws separators between them. One data
 * definition serves a row's ellipsis menu and its long-press menu.
 */
export function MenuItems({ groups }: { groups: MenuGroups }) {
  return groups.map((group) => (
    <Section key={group.map((item) => item.key).join(" ")}>
      {group.map((item) =>
        "items" in item ? (
          <Menu key={item.key} label={item.label} systemImage={item.icon}>
            {item.items.map((action) => (
              <ActionButton key={action.key} action={action} />
            ))}
          </Menu>
        ) : (
          <ActionButton key={item.key} action={item} />
        ),
      )}
    </Section>
  ));
}
