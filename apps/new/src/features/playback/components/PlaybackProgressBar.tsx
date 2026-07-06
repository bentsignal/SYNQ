import { useState } from "react";
import {
  Pressable,
  View,
  type GestureResponderEvent,
  type LayoutChangeEvent,
} from "react-native";
import type { CustomizationTheme } from "@/src/features/settings/hooks/use-customization-theme";

type PlaybackProgressBarProps = {
  duration?: number;
  onSeek?: (position: number) => void;
  progressPercent: number;
  theme: CustomizationTheme;
};

export function PlaybackProgressBar({
  duration = 0,
  onSeek,
  progressPercent,
  theme,
}: PlaybackProgressBarProps) {
  const [width, setWidth] = useState(0);
  const canSeek = Boolean(onSeek) && duration > 0 && width > 0;
  const handleLayout = (event: LayoutChangeEvent) => {
    setWidth(event.nativeEvent.layout.width);
  };
  const handlePress = (event: GestureResponderEvent) => {
    if (!canSeek) {
      return;
    }

    const ratio = Math.max(0, Math.min(event.nativeEvent.locationX / width, 1));
    onSeek?.(ratio * duration);
  };

  return (
    <Pressable
      className="h-2 overflow-hidden rounded-full"
      disabled={!canSeek}
      onLayout={handleLayout}
      onPress={handlePress}
      style={{ backgroundColor: theme.border }}
    >
      <View
        className="h-full rounded-full"
        style={{ backgroundColor: theme.accent, width: `${progressPercent}%` }}
      />
    </Pressable>
  );
}
