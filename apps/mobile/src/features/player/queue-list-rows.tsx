import type { SharedValue } from "react-native-reanimated";
import { Pressable, View } from "react-native";
import Animated, {
  useAnimatedReaction,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";

import type { SongListItem } from "@synq/db";

import type { QueueEntry } from "./queue-model";
import type { QueueDragValues } from "./use-queue-drag";
import type { QueueSwipeState } from "./use-queue-swipe";
import { SymbolIcon } from "~/components/symbol-icon";
import { displacedSlot } from "./queue-layout";
import { QueueRow, QUEUE_ROW_HEIGHT as ROW } from "./queue-row";
import { artistLine } from "./tracks";
import { SWIPE_OPEN } from "./use-queue-swipe";

const SHIFT = { duration: 180 };
const LIFT_SHADOW = "0 6px 18px rgba(0, 0, 0, 0.45)";
const ROW_ACTIONS = [
  { label: "Move Up", name: "moveUp" },
  { label: "Move Down", name: "moveDown" },
  { label: "Remove", name: "remove" },
];

/** A row of Up Next, placed by the UI thread. Rows are recycled. */
export function UpNextRow({
  entry,
  song,
  values: { autoScrolling, floating, from, hover, positions },
  swipe: { index: swipeIndex, x: swipeX },
  onPress,
  onMove,
  onRemove,
}: {
  entry: QueueEntry;
  song: SongListItem;
  values: QueueDragValues;
  swipe: QueueSwipeState;
  onPress: () => void;
  onMove: (delta: number) => void;
  onRemove: () => void;
}) {
  const key = entry.key;
  /** The rest of a slide into this row's slot; 0 at rest. */
  const slide = useSharedValue(0);

  useAnimatedReaction(
    () => {
      const base = positions.get()[key];
      return base === undefined
        ? -1
        : displacedSlot(base, from.get(), hover.get());
    },
    (slot, previous) => {
      if (previous === null || previous === -1 || slot === -1) return;
      const moved = previous - slot;
      // A row closing a gap slides; a recycled row is just in place, and so is
      // one the list is scrolling past too fast to watch.
      const dragged = positions.get()[key] === from.get();
      if (Math.abs(moved) !== 1 || dragged || autoScrolling.get()) {
        slide.set(0);
      } else {
        slide.set(moved * ROW);
        slide.set(withTiming(0, SHIFT));
      }
    },
    [key],
  );

  const style = useAnimatedStyle(() => {
    const base = positions.get()[key];
    const slot =
      base === undefined ? 0 : displacedSlot(base, from.get(), hover.get());
    const lifted = floating.get() && base === from.get();
    return {
      opacity: base === undefined || lifted ? 0 : 1,
      transform: [
        { translateY: slot * ROW + slide.get() },
        { translateX: base === swipeIndex.get() ? swipeX.get() : 0 },
      ],
    };
  }, [key]);

  return (
    <Animated.View
      className="absolute inset-x-0 top-0"
      style={[{ height: ROW }, style]}
    >
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`${song.title}, ${artistLine(song)}`}
        accessibilityActions={ROW_ACTIONS}
        onAccessibilityAction={(event) => {
          const action = event.nativeEvent.actionName;
          if (action === "moveUp") onMove(-1);
          if (action === "moveDown") onMove(1);
          if (action === "remove") onRemove();
        }}
        className="active:bg-fill"
        onPress={onPress}
      >
        <QueueRow song={song} handle />
      </Pressable>
    </Animated.View>
  );
}

/** The dragged row, above the list, so it can outlive its recycled row. */
export function FloatingRow({
  song,
  entryKey,
  values: { floatY, floating, lift },
}: {
  song: SongListItem | undefined;
  entryKey: string | undefined;
  values: QueueDragValues;
}) {
  const style = useAnimatedStyle(() => ({
    opacity: floating.get() ? 1 : 0,
    transform: [{ translateY: floatY.get() }, { scale: lift.get() }],
  }));
  return (
    <Animated.View
      pointerEvents="none"
      className="bg-background-elevated-2 absolute inset-x-0 top-0"
      style={[{ boxShadow: LIFT_SHADOW, height: ROW }, style]}
    >
      {song !== undefined && (
        // Once this has mounted, its row can hide under it.
        <View key={entryKey} onLayout={() => floating.set(true)}>
          <QueueRow song={song} handle />
        </View>
      )}
    </Animated.View>
  );
}

/** Red behind the one row being swiped, sliding in with it. */
export function SwipeBackground({
  swipe: { index: swipeIndex, x: swipeX },
  width,
  onPress,
}: {
  swipe: QueueSwipeState;
  width: SharedValue<number>;
  onPress: () => void;
}) {
  const style = useAnimatedStyle(() => {
    const index = swipeIndex.get();
    return {
      opacity: index === -1 ? 0 : 1,
      transform: [
        { translateY: Math.max(index, 0) * ROW },
        { translateX: width.get() + swipeX.get() },
      ],
    };
  });
  return (
    <Animated.View
      className="bg-destructive absolute inset-x-0 top-0"
      style={[{ height: ROW }, style]}
    >
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Delete"
        className="h-full items-center justify-center"
        style={{ width: SWIPE_OPEN }}
        onPress={onPress}
      >
        <SymbolIcon
          name="trash.fill"
          size={20}
          tintColorClassName="accent-foreground"
        />
      </Pressable>
    </Animated.View>
  );
}
