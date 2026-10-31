import { StyleSheet, View } from "react-native";
import {
  Button,
  ContextMenu,
  HStack,
  Image,
  Menu,
  RNHostView,
} from "@expo/ui/swift-ui";
import {
  accessibilityLabel,
  buttonStyle,
  contentShape,
  frame,
  menuIndicator,
  shapes,
} from "@expo/ui/swift-ui/modifiers";

import type { NativeRowProps } from "./native-row";
import { MENU_WIDTH } from "./menu";
import { MenuItems } from "./menu-items";
import { NativeHost, useNativeColor } from "./native-host";

/**
 * `NativeRow` in a binary without the UIKit menu row (modules/synq-menu):
 * the React Native row hosted in a SwiftUI `ContextMenu` around a
 * `Button`, beside an `ellipsis` `Menu`. A SwiftUI host per row costs a
 * fling through thousands of songs about twice the dropped frames of the
 * UIKit row (docs/ui.md → Song menu).
 */
export function SwiftUIRow({
  height,
  label,
  menu,
  onPress,
  separatorInset,
  children,
}: NativeRowProps) {
  const muted = useNativeColor("--color-muted");
  return (
    <View style={{ height }}>
      <NativeHost style={{ height }}>
        <ContextMenu>
          <ContextMenu.Items>
            <MenuItems groups={menu} />
          </ContextMenu.Items>
          <ContextMenu.Trigger>
            <HStack spacing={0}>
              <Button
                modifiers={[
                  buttonStyle("plain"),
                  frame({ height, maxWidth: Infinity }),
                  contentShape(shapes.rectangle()),
                  accessibilityLabel(label),
                ]}
                onPress={onPress}
              >
                <RNHostView>
                  {/* A fixed height, not flex: SwiftUI reports the host's
                    size a few frames after a row mounts (Vera's rows). */}
                  <View
                    pointerEvents="none"
                    accessibilityElementsHidden
                    // Opaque, so the row lifted into its context menu
                    // doesn't show the rows behind it, and starting a
                    // hairline down: rows under a header of fractional
                    // height overlap by that much, which hid the
                    // separator above.
                    className="bg-background flex-row items-center"
                    style={{
                      height: height - StyleSheet.hairlineWidth,
                      marginTop: StyleSheet.hairlineWidth,
                    }}
                  >
                    {children}
                  </View>
                </RNHostView>
              </Button>
              <Menu
                label={
                  <Image
                    systemName="ellipsis"
                    size={17}
                    color={muted ?? "gray"}
                  />
                }
                modifiers={[
                  menuIndicator("hidden"),
                  frame({ height, width: MENU_WIDTH }),
                  contentShape(shapes.rectangle()),
                  accessibilityLabel("More"),
                ]}
              >
                <MenuItems groups={menu} />
              </Menu>
            </HStack>
          </ContextMenu.Trigger>
        </ContextMenu>
      </NativeHost>
      <View
        pointerEvents="none"
        className="border-b-hairline border-separator absolute right-4 bottom-0"
        style={{ left: separatorInset }}
      />
    </View>
  );
}
