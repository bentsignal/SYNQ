import type { ViewProps } from "react-native";
import { useState } from "react";
import { Text, View } from "react-native";
import { requireNativeView, requireOptionalNativeModule } from "expo";

import { useProgress } from "@synq/audio";

import { selectionTick } from "~/lib/haptics";
import { seekTo } from "./commands";
import { formatTime } from "./format-time";

interface NativeScrubberProps extends ViewProps {
  fraction: number;
  durationSeconds: number;
  seekable: boolean;
  valueText: string;
  onScrub: (event: { nativeEvent: { seconds: number } }) => void;
  onSeek: (event: { nativeEvent: { fraction: number } }) => void;
}

/** `modules/synq-volume`, or null in a binary built before it. */
const NativeScrubber =
  requireOptionalNativeModule("SynqScrubber") === null
    ? null
    : requireNativeView<NativeScrubberProps>("SynqScrubber");

const TIME_STYLE = { fontVariant: ["tabular-nums" as const] };
/** The row with the bar; the times hang under it and take up no room. */
const ROW_HEIGHT = 20;
/** The native view's height: this much of it is touch, beyond the row. */
const TOUCH_HEIGHT = 52;
/** Under the bar, clear of it even at its full height while dragged. */
const TIMES_TOP = ROW_HEIGHT - 2;

/**
 * The player's timeline: two nested bars that grow while dragged, elapsed time
 * on the left and remaining on the right. The drag is relative and native
 * (`BarSliderView.swift`), and the seek happens on release. Disabled while
 * nothing is loaded. Its height is the bar's row: the times hang below it
 * without pushing anything, so what follows is spaced from the bar.
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
  /** The dragged position in whole seconds, or -1 when not dragging. */
  const [dragSeconds, setDragSeconds] = useState(-1);
  /** Where a released drag is going, until the player has gone there. */
  const [seeking, setSeeking] = useState<number | null>(null);

  const liveFraction =
    durationMs > 0
      ? Math.min(Math.max(progress.positionMs / durationMs, 0), 1)
      : 0;
  const fraction = seeking ?? liveFraction;
  const shownMs = dragSeconds >= 0 ? dragSeconds * 1000 : fraction * durationMs;

  function seek(target: number) {
    selectionTick();
    setDragSeconds(-1);
    setSeeking(target);
    void seekTo(target * durationMs).then(() => {
      requestAnimationFrame(() => setSeeking(null));
    });
  }

  return (
    <View style={{ height: ROW_HEIGHT }}>
      {NativeScrubber !== null && (
        <NativeScrubber
          fraction={fraction}
          durationSeconds={durationMs / 1000}
          seekable={!disabled && durationMs > 0}
          valueText={formatTime(shownMs)}
          style={{
            height: TOUCH_HEIGHT,
            marginVertical: (ROW_HEIGHT - TOUCH_HEIGHT) / 2,
          }}
          onScrub={({ nativeEvent }) => setDragSeconds(nativeEvent.seconds)}
          onSeek={({ nativeEvent }) => seek(nativeEvent.fraction)}
        />
      )}
      <View
        pointerEvents="none"
        className="absolute inset-x-0 flex-row justify-between"
        style={{ top: TIMES_TOP }}
      >
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
