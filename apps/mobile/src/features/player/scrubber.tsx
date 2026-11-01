import type { SharedValue } from "react-native-reanimated";
import { useState } from "react";
import { Text, View } from "react-native";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import Animated, {
  useAnimatedReaction,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import { scheduleOnRN } from "react-native-worklets";

import { useProgress } from "@synq/audio";

import { selectionTick } from "~/lib/haptics";
import { seekTo } from "./commands";
import { formatTime } from "./format-time";

const THUMB = 7;
/** While dragging: the thumb and the bar grow, like iOS's own scrubbers. */
const THUMB_GROWN = 2.6;
const BAR_GROWN = 2;
const GROW = { duration: 160 };
const TIME_STYLE = { fontVariant: ["tabular-nums" as const] };

/**
 * The player's scrubber: a thin bar with a small thumb that grows while
 * dragged, elapsed time on the left and remaining on the right. The drag
 * is relative (touching doesn't jump), and the seek happens on release.
 * Disabled while nothing is loaded.
 */
export function Scrubber({
  disabled,
  fallbackDurationMs,
}: {
  disabled: boolean;
  /** The library's duration, until the file reports its own. */
  fallbackDurationMs: number;
}) {
  const progress = useProgress();
  const durationMs =
    progress.durationMs > 0 ? progress.durationMs : fallbackDurationMs;
  const [width, setWidth] = useState(0);
  /** The dragged position in whole seconds, or -1 when not dragging. */
  const [dragSeconds, setDragSeconds] = useState(-1);
  const dragging = useSharedValue(false);
  const start = useSharedValue(0);
  const dragX = useSharedValue(0);
  const fraction =
    durationMs > 0
      ? Math.min(Math.max(progress.positionMs / durationMs, 0), 1)
      : 0;

  function commit(positionMs: number) {
    selectionTick();
    void seekTo(positionMs).then(() => {
      requestAnimationFrame(() => dragging.set(false));
    });
  }

  const pan = Gesture.Pan()
    .enabled(!disabled && width > 0 && durationMs > 0)
    .minDistance(0)
    .hitSlop({ vertical: 16 })
    .onBegin(() => {
      start.set(fraction * width);
      dragX.set(fraction * width);
      dragging.set(true);
    })
    .onUpdate((event) => {
      dragX.set(Math.min(Math.max(start.get() + event.translationX, 0), width));
    })
    .onFinalize(() => {
      scheduleOnRN(commit, (dragX.get() / width) * durationMs);
    });

  useAnimatedReaction(
    () =>
      dragging.get() && width > 0
        ? Math.floor(((dragX.get() / width) * durationMs) / 1000)
        : -1,
    (seconds, previous) => {
      if (seconds !== previous) scheduleOnRN(setDragSeconds, seconds);
    },
  );

  const { barStyle, fillStyle, thumbStyle } = useScrubberStyles({
    dragging,
    dragX,
    fraction,
    width,
  });

  const shownMs = dragSeconds >= 0 ? dragSeconds * 1000 : progress.positionMs;
  return (
    <View className="gap-2">
      <GestureDetector gesture={pan}>
        <View
          className="h-5 justify-center"
          accessibilityRole="adjustable"
          accessibilityLabel="Position"
          accessibilityValue={{ text: formatTime(shownMs) }}
          onLayout={(event) => setWidth(event.nativeEvent.layout.width)}
        >
          <Animated.View
            className="h-1 overflow-hidden rounded-full bg-white/20"
            style={barStyle}
          >
            <Animated.View
              className="h-full w-full bg-white/80"
              style={[{ transformOrigin: "left" }, fillStyle]}
            />
          </Animated.View>
          <Animated.View
            pointerEvents="none"
            className="absolute left-0 rounded-full bg-white"
            style={[{ height: THUMB, width: THUMB }, thumbStyle]}
          />
        </View>
      </GestureDetector>
      <View className="flex-row justify-between">
        <Text className="text-caption text-muted" style={TIME_STYLE}>
          {formatTime(shownMs)}
        </Text>
        <Text className="text-caption text-muted" style={TIME_STYLE}>
          −{formatTime(Math.max(0, durationMs - shownMs))}
        </Text>
      </View>
    </View>
  );
}

/** The bar (thicker while dragging), its fill, and the thumb. */
function useScrubberStyles({
  dragging,
  dragX,
  fraction,
  width,
}: {
  dragging: SharedValue<boolean>;
  dragX: SharedValue<number>;
  fraction: number;
  width: number;
}) {
  const barStyle = useAnimatedStyle(() => ({
    transform: [{ scaleY: withTiming(dragging.get() ? BAR_GROWN : 1, GROW) }],
  }));
  const fillStyle = useAnimatedStyle(() => ({
    transform: [
      {
        scaleX: dragging.get() && width > 0 ? dragX.get() / width : fraction,
      },
    ],
  }));
  const thumbStyle = useAnimatedStyle(() => ({
    transform: [
      {
        translateX:
          (dragging.get() ? dragX.get() : fraction * width) - THUMB / 2,
      },
      { scale: withTiming(dragging.get() ? THUMB_GROWN : 1, GROW) },
    ],
  }));
  return { barStyle, fillStyle, thumbStyle };
}
