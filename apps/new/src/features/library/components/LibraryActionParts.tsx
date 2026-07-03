import type { ReactNode } from "react";
import {
  Pressable,
  Text,
  View,
  type ViewStyle,
} from "react-native";
import type { CustomizationTheme } from "@/src/features/settings/hooks/use-customization-theme";

type LibraryActionVariant = "danger" | "primary" | "secondary";

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

export function LibraryActionButton({
  disabled = false,
  flexGrow = 0,
  label,
  minWidth,
  onPress,
  theme,
  variant,
}: {
  disabled?: boolean;
  flexGrow?: number;
  label: string;
  minWidth?: number;
  onPress: () => void;
  theme: CustomizationTheme;
  variant: LibraryActionVariant;
}) {
  const isPrimary = variant === "primary";
  const isDanger = variant === "danger";

  return (
    <Pressable
      accessibilityRole="button"
      className={`min-h-11 items-center justify-center rounded-lg px-3.5 ${
        isPrimary ? "" : "border"
      } ${disabled ? "opacity-[0.45]" : ""}`}
      disabled={disabled}
      onPress={onPress}
      style={{
        backgroundColor: isPrimary ? theme.accent : theme.surface,
        borderColor: isDanger ? theme.danger : theme.border,
        flexGrow,
        minWidth: minWidth ?? (isDanger ? 112 : 132),
      }}
    >
      <Text
        className="text-[13px] font-extrabold uppercase"
        style={{
          color: isPrimary
            ? theme.onAccent
            : isDanger
              ? theme.danger
              : theme.accent,
        }}
      >
        {label}
      </Text>
    </Pressable>
  );
}
