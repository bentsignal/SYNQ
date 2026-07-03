import { Pressable, Text } from "react-native";
import type { CustomizationTheme } from "@/src/features/settings/hooks/use-customization-theme";

type ImportSaveActionButtonTone = "accent" | "danger" | "secondary";

type ImportSaveActionButtonProps = {
  disabled: boolean;
  label: string;
  onPress: () => void;
  theme: CustomizationTheme;
  tone: ImportSaveActionButtonTone;
};

export function ImportSaveActionButton({
  disabled,
  label,
  onPress,
  theme,
  tone,
}: ImportSaveActionButtonProps) {
  const isAccent = tone === "accent";

  return (
    <Pressable
      accessibilityRole="button"
      disabled={disabled}
      onPress={onPress}
      className={`min-h-[46px] min-w-[110px] flex-grow items-center justify-center rounded-lg px-3.5 ${
        isAccent ? "" : "border"
      } ${disabled ? "opacity-[0.45]" : ""}`}
      style={{
        backgroundColor: isAccent ? theme.accent : theme.surface,
        borderColor: isAccent ? theme.accent : theme.border,
      }}
    >
      <Text
        className="text-[13px] font-extrabold uppercase"
        style={{
          color:
            tone === "accent"
              ? theme.onAccent
              : tone === "danger"
                ? theme.danger
                : theme.accent,
        }}
      >
        {label}
      </Text>
    </Pressable>
  );
}
