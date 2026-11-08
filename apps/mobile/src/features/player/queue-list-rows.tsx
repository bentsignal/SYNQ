import { View } from "react-native";
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
import { displacedSlot, settlingRow } from "./queue-layout";
import { QueueHandle, QueueRow, QUEUE_ROW_HEIGHT as ROW } from "./queue-row";
import { artistLine } from "./tracks";
import { DRAGGING } from "./use-queue-drag";

const SHIFT = { duration: 180 };
const LIFT_SHADOW = "0 6px 18px rgba(0, 0, 0, 0.45)";
/** How far a row's swiped backing takes to show. */
const BACKING_IN = 24;
const ROW_ACTIONS = [
  { label: "Play Next", name: "playNext" },
  { label: "Add to Queue", name: "addToQueue" },
  { label: "Move Up", name: "moveUp" },
  { label: "Move Down", name: "moveDown" },
  { label: "Delete", name: "delete" },
] as const;

export type RowAction = (typeof ROW_ACTIONS)[number]["name"];

/** A row of Up Next, placed by the UI thread. Rows are recycled. */
export function UpNextRow({
  entry,
  song,
  values: {
    autoScrolling,
    floating,
    from,
    hover,
    movedKey,
    orderProgress,
    phase,
    positions,
    previousPositions,
  },
  swipe,
  onPlay,
  onAction,
}: {
  entry: QueueEntry;
  song: SongListItem;
  values: QueueDragValues;
  swipe: QueueSwipeState;
  onPlay: () => void;
  onAction: (action: RowAction) => void;
}) {
  const key = entry.key;
  /** The rest of a slide into this row's slot during a drag; 0 at rest. */
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
      // A row closing a gap under the drag slides; a recycled row is just in
      // place, and so is one the list is scrolling past too fast to watch.
      const dragged = positions.get()[key] === from.get();
      if (
        phase.get() !== DRAGGING ||
        Math.abs(moved) !== 1 ||
        dragged ||
        autoScrolling.get()
      ) {
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
    const moved = movedKey.get();
    const settling = settlingRow({
      anyMoved: moved !== null,
      isMoved: key === moved,
      previous: previousPositions.get()[key],
      progress: orderProgress.get(),
      slot,
    });
    return {
      opacity: base === undefined || lifted ? 0 : settling.opacity,
      transform: [
        { translateY: settling.slot * ROW + slide.get() },
        { translateX: base === swipe.index.get() ? swipe.x.get() : 0 },
      ],
    };
  }, [key]);

  return (
    <Animated.View
      className="absolute inset-x-0 top-0 flex-row"
      style={[{ height: ROW }, style]}
    >
      <RowBackground entryKey={key} positions={positions} swipe={swipe} />
      <View
        accessible
        accessibilityRole="button"
        accessibilityLabel={`${song.title}, ${artistLine(song)}`}
        accessibilityActions={ROW_ACTIONS}
        onAccessibilityTap={onPlay}
        onAccessibilityAction={(event) => {
          const action = ROW_ACTIONS.find(
            ({ name }) => name === event.nativeEvent.actionName,
          );
          if (action !== undefined) onAction(action.name);
        }}
        className="flex-1"
      >
        <QueueRow song={song} />
      </View>
      <QueueHandle />
    </Animated.View>
  );
}

/**
 * Behind a row: while it's swiped, a rounded backing, as iOS 27 gives a
 * swiped table row; while it's touched, the highlight.
 */
function RowBackground({
  entryKey,
  positions,
  swipe: { highlight, index, pressIndex, x },
}: {
  entryKey: string;
  positions: QueueDragValues["positions"];
  swipe: QueueSwipeState;
}) {
  const backing = useAnimatedStyle(() => {
    const swiped = positions.get()[entryKey] === index.get();
    return {
      opacity: swiped ? Math.min(Math.abs(x.get()) / BACKING_IN, 1) : 0,
    };
  }, [entryKey]);
  const highlighted = useAnimatedStyle(() => {
    const pressed = positions.get()[entryKey] === pressIndex.get();
    return { opacity: pressed ? highlight.get() : 0 };
  }, [entryKey]);
  return (
    <>
      <Animated.View
        className="bg-fill absolute inset-0"
        style={[{ borderRadius: ROW / 2 }, backing]}
      />
      <Animated.View className="bg-fill absolute inset-0" style={highlighted} />
    </>
  );
}

/** The dragged row, above the list, so it can outlive its recycled row. */
export function FloatingRow({
  song,
  entryKey,
  values: { floatY, floating, from, lift },
}: {
  song: SongListItem | undefined;
  entryKey: string | undefined;
  values: QueueDragValues;
}) {
  const style = useAnimatedStyle(() => ({
    // A quick tap can let go before this has even mounted.
    opacity: floating.get() && from.get() !== -1 ? 1 : 0,
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
        <View
          key={entryKey}
          className="flex-row"
          onLayout={() => floating.set(true)}
        >
          <View className="flex-1">
            <QueueRow song={song} />
          </View>
          <QueueHandle />
        </View>
      )}
    </Animated.View>
  );
}
