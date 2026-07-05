import type { ReactNode } from "react";
import { View, type ViewStyle } from "react-native";

export function LibraryActionRow({
  alignItems,
  children,
}: {
  alignItems?: ViewStyle["alignItems"];
  children: ReactNode;
}) {
  return (
    <View
      className="flex-row flex-wrap gap-3"
      style={alignItems ? { alignItems } : undefined}
    >
      {children}
    </View>
  );
}

