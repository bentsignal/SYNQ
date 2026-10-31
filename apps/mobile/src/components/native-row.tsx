import type { ReactNode } from "react";
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

import type { MenuGroups } from "./menu";
import { MenuItems } from "./menu-items";
import { NativeHost, useNativeColor } from "./native-host";

/** The trailing ellipsis button's width. */
const MENU_WIDTH = 44;

/**
 * A list row hosted in SwiftUI, after Vera's Inbox rows: a long press
 * lifts the row into a native context menu, and a tap dims it as a
 * SwiftUI button does. `menu` fills both that context menu and the
 * trailing `ellipsis` menu. `children` is the row's React Native look,
 * ignoring touches so SwiftUI handles them, and hidden from accessibility
 * (the button reads `label`; see Vera's `inbox-row.ios.tsx` for why).
 *
 * Unlike Vera's rows there's no one-row SwiftUI `List` around it (for the
 * system's highlight and separator): with thousands of songs, a list per
 * row nearly doubled the frames a fling dropped (265 against 145 in the
 * same conditions), so the separator is a React Native hairline.
 */
export function NativeRow({
  height,
  label,
  menu,
  onPress,
  separatorInset,
  children,
}: {
  height: number;
  /** What VoiceOver reads for the row. */
  label: string;
  menu: MenuGroups;
  onPress: () => void;
  /** Where the separator starts, usually where the text starts. */
  separatorInset: number;
  children: ReactNode;
}) {
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
