import type { ReactNode } from "react";
import { View, type ViewStyle } from "react-native";
import type { SongRowTheme } from "./SongRowTheme";

export function SongRowShell({
  children,
  isActive = false,
  minHeight = 66,
  style,
  theme,
}: {
  children: ReactNode;
  isActive?: boolean;
  minHeight?: number;
  style?: ViewStyle;
  theme: SongRowTheme;
}) {
  return (
    <View
      className="flex-row items-center gap-3 border-b px-3.5 py-2.5"
      style={[
        { borderBottomColor: theme.borderSubtle, minHeight },
        isActive ? { backgroundColor: theme.borderSubtle } : null,
        style,
      ]}
    >
      {children}
    </View>
  );
}

