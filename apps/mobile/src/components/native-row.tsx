import type { ReactNode } from "react";
import { processColor, StyleSheet, View } from "react-native";

import type { MenuGroups } from "./menu";
import { afterMenuCloses, MENU_WIDTH, menuAction, menuJson } from "./menu";
import { useNativeColor } from "./native-host";
import { MenuRowView } from "./native-menu-row";
import { RowSeparator } from "./row-separator";
import { SwiftUIRow } from "./swiftui-row";

export interface NativeRowProps {
  height: number;
  /** What VoiceOver reads for the row. */
  label: string;
  menu: MenuGroups;
  onPress: () => void;
  /** Where the separator starts, usually where the text starts; none when left out. */
  separatorInset?: number;
  /** Whether the trailing `ellipsis` button shows; long press works either way. */
  menuButton?: boolean;
  children: ReactNode;
}

/**
 * A list row with the native touches of a table view row: a tap
 * highlights it, a long press lifts it into a context menu, and the
 * trailing `ellipsis` button (song rows) opens the same menu. `children`
 * is the row's React Native look; UIKit (modules/synq-menu) handles the
 * touches and builds `menu` only when one opens, so thousands of rows
 * scroll as cheaply as plain views (docs/ui.md → Song menu). Collection
 * rows and artwork cards use it too, without the button or a separator.
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
  menuButton = true,
  children,
}: NativeRowProps) {
  const buttonWidth = menuButton ? MENU_WIDTH : 0;
  const muted = useNativeColor("--color-muted");
  const background = useNativeColor("--color-background");
  const fill = useNativeColor("--color-fill");
  if (MenuRowView === null) return null;
  return (
    <View style={{ height }}>
      <MenuRowView
        menu={menuJson(menu)}
        label={label}
        buttonWidth={buttonWidth}
        buttonColor={processColor(muted)}
        rowColor={processColor(background)}
        highlightColor={processColor(fill)}
        onRowPress={onPress}
        onRowMenuAction={({ nativeEvent }) => {
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
            paddingRight: buttonWidth,
          }}
        >
          {children}
        </View>
      </MenuRowView>
      {separatorInset !== undefined && <RowSeparator inset={separatorInset} />}
    </View>
  );
}
