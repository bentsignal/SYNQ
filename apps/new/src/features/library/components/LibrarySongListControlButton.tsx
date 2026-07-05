import { Pressable, Text } from "react-native";
import type { CustomizationTheme } from "@/src/features/settings/hooks/use-customization-theme";

type LibrarySongListControlButtonProps = {
  isActive?: boolean;
  label: string;
  onPress: () => void;
  theme: CustomizationTheme;
  variant?: "primary" | "toggle";
};

export function LibrarySongListControlButton({
  isActive = false,
  label,
  onPress,
  theme,
  variant = "primary",
}: LibrarySongListControlButtonProps) {
  const isToggle = variant === "toggle";
  const backgroundColor = isToggle
    ? theme.primaryText
    : isActive
      ? theme.accent
      : theme.surface;
  const borderColor = isToggle
    ? theme.primaryText
    : isActive
      ? theme.accent
      : theme.border;
  const color = isToggle
    ? theme.surface
    : isActive
      ? theme.onAccent
      : theme.secondaryText;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ selected: isActive }}
      className="min-h-[38px] min-w-[72px] items-center justify-center rounded-lg border px-3"
      onPress={onPress}
      style={{
        backgroundColor,
        borderColor,
      }}
    >
      <Text
        className="text-xs font-extrabold uppercase"
        style={{ color }}
      >
        {label}
      </Text>
    </Pressable>
  );
}
