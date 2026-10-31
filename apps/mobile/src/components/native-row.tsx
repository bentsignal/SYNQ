import type { ReactNode } from "react";
import { View } from "react-native";
import {
  Button,
  ContextMenu,
  HStack,
  Image,
  List,
  Menu,
  RNHostView,
} from "@expo/ui/swift-ui";
import {
  accessibilityLabel,
  alignmentGuide,
  buttonStyle,
  contentShape,
  frame,
  listRowBackground,
  listRowInsets,
  listRowSeparator,
  listStyle,
  menuIndicator,
  scrollContentBackground,
  scrollDisabled,
  shapes,
} from "@expo/ui/swift-ui/modifiers";

import type { MenuGroups } from "./menu";
import { MenuItems } from "./menu-items";
import { NativeHost, useNativeColor } from "./native-host";

/** The trailing ellipsis button's width. */
const MENU_WIDTH = 44;

/**
 * A list row hosted in SwiftUI, like Vera's Inbox rows: a one-row plain
 * `List`, so a tap gets the system's own highlight and a long press lifts
 * the row into a native context menu. `menu` fills both that context menu
 * and the trailing `ellipsis` menu. `children` is the row's React Native
 * look, ignoring touches so SwiftUI handles them, and hidden from
 * accessibility (the button reads `label`; see Vera's `inbox-row.ios.tsx`
 * for why).
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
  const background = useNativeColor("--color-background");
  const muted = useNativeColor("--color-muted");
  return (
    <NativeHost style={{ height }}>
      <List
        modifiers={[
          listStyle("plain"),
          scrollDisabled(true),
          scrollContentBackground("hidden"),
        ]}
      >
        <ContextMenu
          modifiers={[
            listRowInsets({ bottom: 0, leading: 0, top: 0, trailing: 0 }),
            listRowSeparator("visible", "bottom"),
            ...(background === undefined ? [] : [listRowBackground(background)]),
          ]}
        >
          <ContextMenu.Items>
            <MenuItems groups={menu} />
          </ContextMenu.Items>
          <ContextMenu.Trigger>
            <HStack
              spacing={0}
              modifiers={[alignmentGuide("listRowSeparatorLeading", separatorInset)]}
            >
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
                    className="flex-row items-center"
                    style={{ height }}
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
      </List>
    </NativeHost>
  );
}
