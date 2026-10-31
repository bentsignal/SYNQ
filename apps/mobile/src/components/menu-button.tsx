import { Image, Menu } from "@expo/ui/swift-ui";
import {
  accessibilityLabel,
  contentShape,
  frame,
  menuIndicator,
  shapes,
} from "@expo/ui/swift-ui/modifiers";

import type { MenuGroups } from "./menu";
import { MenuItems } from "./menu-items";
import { NativeHost } from "./native-host";

/**
 * A native `ellipsis` button that opens `menu`, for places outside a
 * `NativeRow` (the player). `size` is the tappable square.
 */
export function MenuButton({
  menu,
  size,
  color = "white",
}: {
  menu: MenuGroups;
  size: number;
  color?: string;
}) {
  return (
    <NativeHost style={{ height: size, width: size }}>
      <Menu
        label={<Image systemName="ellipsis" size={20} color={color} />}
        modifiers={[
          menuIndicator("hidden"),
          frame({ height: size, width: size }),
          contentShape(shapes.rectangle()),
          accessibilityLabel("More"),
        ]}
      >
        <MenuItems groups={menu} />
      </Menu>
    </NativeHost>
  );
}
