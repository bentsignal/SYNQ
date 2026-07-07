import { useState } from "react";
import {
  View,
  type GestureResponderEvent,
  type LayoutChangeEvent,
} from "react-native";
import type { CustomizationTheme } from "@/src/features/settings/hooks/use-customization-theme";
import {
  getPlaybackProgressPercent,
  getSeekPositionFromProgressBar,
} from "../services/playback-player-progress-service";

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
  const [previewPosition, setPreviewPosition] = useState<number | null>(null);
  const canSeek = Boolean(onSeek) && duration > 0 && width > 0;
  const displayedProgressPercent =
    previewPosition === null
      ? progressPercent
      : getPlaybackProgressPercent({
          duration,
          position: previewPosition,
        });
  const handleLayout = (event: LayoutChangeEvent) => {
    setWidth(event.nativeEvent.layout.width);
  };
  const getPositionFromEvent = (event: GestureResponderEvent) =>
    getSeekPositionFromProgressBar({
      duration,
      locationX: event.nativeEvent.locationX,
      width,
    });
  const previewSeekFromEvent = (event: GestureResponderEvent) => {
    if (canSeek) {
      setPreviewPosition(getPositionFromEvent(event));
    }
  };
  const commitSeekFromEvent = (event: GestureResponderEvent) => {
    if (canSeek) {
      onSeek?.(getPositionFromEvent(event));
    }

    setPreviewPosition(null);
  };

  return (
    <View
      accessibilityLabel="Playback position"
      accessibilityRole="adjustable"
      className="h-8 justify-center"
      onLayout={handleLayout}
      onMoveShouldSetResponder={() => canSeek}
      onResponderGrant={previewSeekFromEvent}
      onResponderMove={previewSeekFromEvent}
      onResponderRelease={commitSeekFromEvent}
      onResponderTerminate={() => setPreviewPosition(null)}
      onStartShouldSetResponder={() => canSeek}
    >
      <View
        className="h-2 overflow-hidden rounded-full"
        style={{ backgroundColor: theme.border }}
      >
        <View
          className="h-full rounded-full"
          style={{
            backgroundColor: theme.accent,
            width: `${displayedProgressPercent}%`,
          }}
        />
      </View>
    </View>
  );
}
