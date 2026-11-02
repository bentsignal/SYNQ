import type { StyleProp, ViewStyle } from "react-native";
import { processColor } from "react-native";
import { requireNativeView, requireOptionalNativeModule } from "expo";
import { Image, Menu } from "@expo/ui/swift-ui";
import {
  accessibilityLabel,
  contentShape,
  frame,
  menuIndicator,
  shapes,
} from "@expo/ui/swift-ui/modifiers";

import type { MenuGroups } from "./menu";
import { afterMenuCloses, menuAction, menuJson } from "./menu";
import { MenuItems } from "./menu-items";
import { NativeHost } from "./native-host";

interface MenuButtonViewProps {
  menu: string;
  color: ReturnType<typeof processColor>;
  style: StyleProp<ViewStyle>;
  onMenuAction: (event: { nativeEvent: { id: string } }) => void;
}

/** `MenuButtonView.swift`, or null in a binary built before it. */
const MenuButtonView =
  requireOptionalNativeModule("SynqMenuButton") === null
    ? null
    : requireNativeView<MenuButtonViewProps>("SynqMenuButton");

/**
 * A native `ellipsis` button that opens `menu`, for places outside a
 * `NativeRow` (the player). All of `width` by `height` takes the touch, with
 * the dots in its center.
 */
export function MenuButton({
  menu,
  width,
  height,
  color = "white",
  style,
}: {
  menu: MenuGroups;
  width: number;
  height: number;
  color?: string;
  style?: StyleProp<ViewStyle>;
}) {
  if (MenuButtonView !== null) {
    return (
      <MenuButtonView
        menu={menuJson(menu)}
        color={processColor(color)}
        style={[{ height, width }, style]}
        onMenuAction={({ nativeEvent }) => {
          const action = menuAction(menu, nativeEvent.id);
          if (action !== undefined) afterMenuCloses(action.onPress);
        }}
      />
    );
  }
  return (
    <NativeHost style={[{ height, width }, style]}>
      <Menu
        // SwiftUI's menu only takes touches on its label, so the label is
        // the whole button.
        label={
          <Image
            systemName="ellipsis"
            size={15}
            color={color}
            modifiers={[
              frame({ height, width }),
              contentShape(shapes.rectangle()),
            ]}
          />
        }
        modifiers={[menuIndicator("hidden"), accessibilityLabel("More")]}
      >
        <MenuItems groups={menu} />
      </Menu>
    </NativeHost>
  );
}
