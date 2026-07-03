import type { ReactNode } from "react";
import {
  Pressable,
  StyleSheet,
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
    <View style={[styles.actionRow, alignItems ? { alignItems } : null]}>
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
      disabled={disabled}
      onPress={onPress}
      style={[
        styles.button,
        {
          backgroundColor: isPrimary ? theme.accent : theme.surface,
          borderColor: isDanger ? theme.danger : theme.border,
          flexGrow,
          minWidth: minWidth ?? (isDanger ? 112 : 132),
        },
        isPrimary ? styles.primaryButton : styles.outlineButton,
        disabled ? styles.disabled : null,
      ]}
    >
      <Text
        style={[
          styles.buttonText,
          {
            color: isPrimary
              ? theme.onAccent
              : isDanger
                ? theme.danger
                : theme.accent,
          },
        ]}
      >
        {label}
      </Text>
    </Pressable>
  );
}

export const libraryActionPartStyles = StyleSheet.create({
  disabled: {
    opacity: 0.45,
  },
  linkButton: {
    alignItems: "center",
    borderRadius: 8,
    borderWidth: 1,
    fontSize: 13,
    fontWeight: "800",
    justifyContent: "center",
    letterSpacing: 0,
    minHeight: 44,
    overflow: "hidden",
    paddingHorizontal: 14,
    textAlign: "center",
    textTransform: "uppercase",
  },
  linkText: {
    fontSize: 14,
    fontWeight: "800",
    letterSpacing: 0,
    textTransform: "uppercase",
  },
});

const styles = StyleSheet.create({
  actionRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  button: {
    alignItems: "center",
    borderRadius: 8,
    justifyContent: "center",
    minHeight: 44,
    paddingHorizontal: 14,
  },
  buttonText: {
    fontSize: 13,
    fontWeight: "800",
    letterSpacing: 0,
    textTransform: "uppercase",
  },
  disabled: {
    opacity: 0.45,
  },
  outlineButton: {
    borderWidth: 1,
  },
  primaryButton: {
    borderWidth: 0,
  },
});
