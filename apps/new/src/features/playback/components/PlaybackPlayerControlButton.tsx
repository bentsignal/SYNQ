import { Pressable, Text } from "react-native";
import { useCustomizationTheme } from "@/src/features/settings/hooks/use-customization-theme";

type PlaybackPlayerControlButtonProps = {
  disabled?: boolean;
  label: string;
  onPress: () => void;
  selected?: boolean;
  variant?: "primary" | "secondary";
};

export function PlaybackPlayerControlButton({
  disabled = false,
  label,
  onPress,
  selected = false,
  variant = "secondary",
}: PlaybackPlayerControlButtonProps) {
  const theme = useCustomizationTheme();
  const isPrimary = variant === "primary";

  return (
    <Pressable
      accessibilityRole="button"
      className={`min-h-[46px] flex-grow items-center justify-center rounded-lg px-3.5 ${
        isPrimary ? "min-w-[110px]" : "min-w-24 border"
      } ${disabled ? "opacity-[0.45]" : ""}`}
      disabled={disabled}
      onPress={onPress}
      style={
        isPrimary || selected
          ? { backgroundColor: theme.accent }
          : { backgroundColor: theme.surface, borderColor: theme.border }
      }
    >
      <Text
        className="text-[13px] font-extrabold uppercase"
        style={{
          color: isPrimary || selected ? theme.onAccent : theme.primaryText,
        }}
      >
        {label}
      </Text>
    </Pressable>
  );
}
