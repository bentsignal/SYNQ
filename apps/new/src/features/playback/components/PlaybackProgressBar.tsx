import { View } from "react-native";
import type { CustomizationTheme } from "@/src/features/settings/hooks/use-customization-theme";

type PlaybackProgressBarProps = {
  progressPercent: number;
  theme: CustomizationTheme;
};

export function PlaybackProgressBar({
  progressPercent,
  theme,
}: PlaybackProgressBarProps) {
  return (
    <View
      className="h-2 overflow-hidden rounded-full"
      style={{ backgroundColor: theme.border }}
    >
      <View
        className="h-full rounded-full"
        style={{ backgroundColor: theme.accent, width: `${progressPercent}%` }}
      />
    </View>
  );
}
