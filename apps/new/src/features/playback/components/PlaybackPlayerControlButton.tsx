import { Pressable, StyleSheet, Text } from "react-native";
import { useCustomizationTheme } from "@/src/features/settings/hooks/use-customization-theme";

type PlaybackPlayerControlButtonProps = {
  disabled?: boolean;
  label: string;
  onPress: () => void;
  variant?: "primary" | "secondary";
};

export function PlaybackPlayerControlButton({
  disabled = false,
  label,
  onPress,
  variant = "secondary",
}: PlaybackPlayerControlButtonProps) {
  const theme = useCustomizationTheme();
  const isPrimary = variant === "primary";

  return (
    <Pressable
      accessibilityRole="button"
      disabled={disabled}
      onPress={onPress}
      style={[
        isPrimary ? styles.primaryButton : styles.controlButton,
        isPrimary
          ? { backgroundColor: theme.accent }
          : { backgroundColor: theme.surface, borderColor: theme.border },
        disabled ? styles.disabled : null,
      ]}
    >
      <Text
        style={[
          isPrimary ? styles.primaryText : styles.controlText,
          { color: isPrimary ? theme.onAccent : theme.primaryText },
        ]}
      >
        {label}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  controlButton: {
    alignItems: "center",
    borderRadius: 8,
    borderWidth: 1,
    flexGrow: 1,
    justifyContent: "center",
    minHeight: 46,
    minWidth: 96,
    paddingHorizontal: 14,
  },
  controlText: {
    fontSize: 13,
    fontWeight: "800",
    letterSpacing: 0,
    textTransform: "uppercase",
  },
  disabled: {
    opacity: 0.45,
  },
  primaryButton: {
    alignItems: "center",
    borderRadius: 8,
    flexGrow: 1,
    justifyContent: "center",
    minHeight: 46,
    minWidth: 110,
    paddingHorizontal: 14,
  },
  primaryText: {
    fontSize: 13,
    fontWeight: "800",
    letterSpacing: 0,
    textTransform: "uppercase",
  },
});
