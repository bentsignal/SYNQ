import type { ReactNode } from "react";
import { processColor, StyleSheet, View } from "react-native";

import type { MenuGroups } from "./menu";
import { afterMenuCloses, MENU_WIDTH, menuAction, menuJson } from "./menu";
import { useNativeColor } from "./native-host";
import { MenuRowView } from "./native-menu-row";
import { SwiftUIRow } from "./swiftui-row";

export interface NativeRowProps {
  height: number;
  /** What VoiceOver reads for the row. */
  label: string;
  menu: MenuGroups;
  onPress: () => void;
  /** Where the separator starts, usually where the text starts. */
  separatorInset: number;
  children: ReactNode;
}

/**
 * A list row with the native touches of a table view row: a tap
 * highlights it, a long press lifts it into a context menu, and the
 * trailing `ellipsis` button opens the same menu. `children` is the row's
 * React Native look; UIKit (modules/synq-menu) handles the touches and
 * builds `menu` only when one opens, so thousands of rows scroll as
 * cheaply as plain views (docs/ui.md → Song menu).
 */
export function NativeRow(props: NativeRowProps) {
  if (MenuRowView === null) return <SwiftUIRow {...props} />;
  return <MenuRow {...props} />;
}

function MenuRow({
  height,
  label,
  menu,
  onPress,
  separatorInset,
  children,
}: NativeRowProps) {
  const muted = useNativeColor("--color-muted");
  const background = useNativeColor("--color-background");
  const fill = useNativeColor("--color-fill");
  if (MenuRowView === null) return null;
  return (
    <View style={{ height }}>
      <MenuRowView
        menu={menuJson(menu)}
        label={label}
        buttonWidth={MENU_WIDTH}
        buttonColor={processColor(muted)}
        rowColor={processColor(background)}
        highlightColor={processColor(fill)}
        onPress={onPress}
        onMenuAction={({ nativeEvent }) => {
          const action = menuAction(menu, nativeEvent.id);
          if (action !== undefined) afterMenuCloses(action.onPress);
        }}
        // Starting a hairline down: rows under a header of fractional
        // height overlap by that much, and the opaque row hid the
        // separator above.
        style={{
          height: height - StyleSheet.hairlineWidth,
          marginTop: StyleSheet.hairlineWidth,
        }}
      >
        <View
          className="flex-row items-center"
          style={{
            height: height - StyleSheet.hairlineWidth,
            paddingRight: MENU_WIDTH,
          }}
        >
          {children}
        </View>
      </MenuRowView>
      <View
        pointerEvents="none"
        className="border-b-hairline border-separator absolute right-4 bottom-0"
        style={{ left: separatorInset }}
      />
    </View>
  );
}
