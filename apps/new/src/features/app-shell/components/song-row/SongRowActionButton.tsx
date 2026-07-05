import { Pressable, Text, type ViewStyle } from "react-native";

export function SongRowActionButton({
  accessibilityLabel,
  backgroundColor,
  borderColor,
  disabled = false,
  label,
  minWidth = 58,
  onPress,
  textColor,
}: {
  accessibilityLabel?: string;
  backgroundColor: string;
  borderColor?: string;
  disabled?: boolean;
  label: string;
  minWidth?: number;
  onPress: () => void;
  textColor: string;
}) {
  return (
    <Pressable
      accessibilityLabel={accessibilityLabel}
      accessibilityRole="button"
      disabled={disabled}
      onPress={onPress}
      className="min-h-9 items-center justify-center rounded-lg border px-2.5"
      style={[
        {
          backgroundColor,
          borderColor: borderColor ?? backgroundColor,
          minWidth,
        },
        disabled ? styles.disabled : null,
      ]}
    >
      <Text
        className="text-xs font-extrabold uppercase"
        style={{ color: textColor }}
      >
        {label}
      </Text>
    </Pressable>
  );
}

const styles = {
  disabled: {
    opacity: 0.45,
  },
} satisfies Record<string, ViewStyle>;

