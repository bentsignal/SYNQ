import type { ReactNode } from "react";
import type { LayoutChangeEvent } from "react-native";
import { useLayoutEffect, useState, useSyncExternalStore } from "react";
import { View } from "react-native";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import Animated, {
  useAnimatedRef,
  useAnimatedScrollHandler,
  useSharedValue,
} from "react-native-reanimated";

import type { SongListItem } from "@synq/db";

import type { RowAction } from "./queue-list-rows";
import type { QueueEntry } from "./queue-model";
import type { QueueSlots } from "./queue-slots";
import type { QueueDragValues } from "./use-queue-drag";
import type { QueueGeometry } from "./use-queue-geometry";
import type { QueueSwipeState } from "./use-queue-swipe";
import { devQueueDrag } from "~/features/dev/dev-only";
import {
  cueQueueEntry,
  nudgeInUpNext,
  playEntry,
  removeEntry,
  upNextEntry,
  upNextEntryAt,
} from "./commands";
import { FloatingRow, RowUnderlays, UpNextRow } from "./queue-list-rows";
import { songIdOf } from "./queue-model";
import { QUEUE_HANDLE_WIDTH, QUEUE_ROW_HEIGHT as ROW } from "./queue-row";
import { createQueueSlots } from "./queue-slots";
import { SwipeActions } from "./queue-swipe-actions";
import { useSlideNextOrder } from "./slide-next-order";
import { useQueueDrag } from "./use-queue-drag";
import { useQueueGeometry } from "./use-queue-geometry";
import { useQueueSwipe } from "./use-queue-swipe";
import { useQueueWindow } from "./use-queue-window";

/** Development and profiling bundles only. */
const QueueDragDriver = devQueueDrag?.QueueDragDriver;

/**
 * Up Next, drawn by hand so a reorder costs nothing however long the queue
 * is (`README.md`, Reordering the queue). The list's gestures handle every
 * row: a touch on the handle's side picks the row up at once, and anywhere
 * else a tap plays the row and a swipe opens its actions: left Delete, right
 * Add to Queue and Play Next.
 */
export function QueueList({
  header,
  entries,
  songs,
}: {
  header: ReactNode;
  entries: readonly QueueEntry[];
  songs: ReadonlyMap<number, SongListItem>;
}) {
  const scrollRef = useAnimatedRef<Animated.ScrollView>();
  const geometry = useQueueGeometry(entries.length);
  const { listTop, scrollY, viewportHeight, width } = geometry;
  const { act, gestures, onListScroll, slideNextOrder, swipe } =
    useRowActions(geometry);
  const { onScrolled, orderShown, slots } = useQueueWindow(entries, geometry);
  const [slotStore] = useState(() => createQueueSlots(slots));
  // Before paint, and before the UI thread gets the new order (a frame on).
  useLayoutEffect(() => slotStore.set(slots), [slotStore, slots]);
  const { begin, end, isIdle, lifted, move, values } = useQueueDrag({
    entries,
    geometry,
    orderShown,
    scrollRef,
    slideNextOrder,
    swipe,
  });
  const reorder = useReorderGesture({
    begin,
    end,
    geometry,
    isIdle,
    move,
    swipe,
  });

  const onScroll = useListScroll(geometry, (y, dragging) => {
    "worklet";
    onScrolled(y);
    onListScroll(dragging);
  });

  function onFrame(event: LayoutChangeEvent) {
    viewportHeight.set(event.nativeEvent.layout.height);
    width.set(event.nativeEvent.layout.width);
  }

  return (
    <GestureDetector
      gesture={Gesture.Race(reorder, gestures.pan, gestures.tap)}
    >
      <View className="flex-1" onLayout={onFrame} collapsable={false}>
        <Animated.ScrollView
          ref={scrollRef}
          contentInsetAdjustmentBehavior="automatic"
          alwaysBounceVertical
          onScroll={onScroll}
          scrollEventThrottle={16}
          style={{ flex: 1 }}
        >
          {header}
          {entries.length > 0 && (
            <View
              onLayout={(event) => listTop.set(event.nativeEvent.layout.y)}
              style={{ height: entries.length * ROW }}
            >
              <UpNextRows
                pool={slots.length}
                slots={slotStore}
                songs={songs}
                values={values}
                swipe={swipe}
                width={geometry.width}
                onAction={act}
              />
            </View>
          )}
        </Animated.ScrollView>
        {QueueDragDriver !== undefined && (
          <QueueDragDriver
            begin={(index) => {
              "worklet";
              const y = listTop.get() + (index + 0.5) * ROW - scrollY.get();
              begin(index, y, ROW / 2);
              return y;
            }}
            move={move}
            end={end}
          />
        )}
        <FloatingRow
          song={lifted === null ? undefined : songs.get(lifted.entry.songId)}
          pickup={lifted?.pickup}
          values={values}
        />
      </View>
    </GestureDetector>
  );
}

/**
 * What a row's swipe, tap, or screen-reader action does. A row's action
 * marks the order it makes, so the rows slide into it. These look the entry
 * up in the queue when they run, so they stay the same as it changes, and so
 * do the rows they're given.
 */
function useRowActions(geometry: QueueGeometry) {
  const slideNextOrder = useSlideNextOrder();

  function act(key: string | undefined, action: RowAction) {
    if (key === undefined || upNextEntry(key) === undefined) return;
    // Set first: the queue's new order renders before these return.
    const moves = action !== "delete";
    slideNextOrder.mark({ moved: moves ? key : null });
    const changed =
      action === "playNext" || action === "addToQueue"
        ? cueQueueEntry(key, action === "playNext" ? "next" : "last")
        : action === "delete"
          ? removeEntry(key)
          : nudgeInUpNext(key, action === "moveUp" ? -1 : 1);
    if (!changed) slideNextOrder.mark(null);
  }

  const {
    gestures,
    onListScroll,
    state: swipe,
  } = useQueueSwipe(geometry, {
    cue: (index, place) =>
      act(
        upNextEntryAt(index)?.key,
        place === "next" ? "playNext" : "addToQueue",
      ),
    play: (index) => {
      const entry = upNextEntryAt(index);
      if (entry !== undefined) playEntry(entry.key);
    },
    remove: (index) => act(upNextEntryAt(index)?.key, "delete"),
  });
  return { act, gestures, onListScroll, slideNextOrder, swipe };
}

function useListScroll(
  { maxScroll, scrollY, scrollYIsDriven, topInset }: QueueGeometry,
  onScrolled: (y: number, dragging: boolean) => void,
) {
  const dragging = useSharedValue(false);
  return useAnimatedScrollHandler({
    onBeginDrag: () => dragging.set(true),
    onEndDrag: () => dragging.set(false),
    onScroll: (event) => {
      const { contentInset, contentOffset, contentSize, layoutMeasurement } =
        event;
      if (!scrollYIsDriven.get()) scrollY.set(contentOffset.y);
      topInset.set(contentInset.top);
      maxScroll.set(
        Math.max(
          contentSize.height + contentInset.bottom - layoutMeasurement.height,
          -contentInset.top,
        ),
      );
      onScrolled(contentOffset.y, dragging.get());
    },
  });
}

function useReorderGesture({
  begin,
  end,
  geometry: { count, listTop, scrollY, width },
  isIdle,
  move,
  swipe: { index: swipeIndex },
}: {
  begin: (index: number, y: number, grab: number) => void;
  end: () => void;
  geometry: QueueGeometry;
  isIdle: () => boolean;
  move: (y: number) => void;
  swipe: QueueSwipeState;
}) {
  return Gesture.Pan()
    .manualActivation(true)
    .onTouchesDown((event, manager) => {
      const touch = event.allTouches[0];
      if (touch === undefined || !isIdle()) {
        manager.fail();
        return;
      }
      const offset = touch.y + scrollY.get() - listTop.get();
      const index = Math.floor(offset / ROW);
      // With a row open, a touch only closes it or taps its actions.
      if (swipeIndex.get() !== -1) {
        manager.fail();
        return;
      }
      const onHandle = touch.x >= width.get() - QUEUE_HANDLE_WIDTH;
      if (!onHandle || offset < 0 || index >= count.get()) {
        manager.fail();
        return;
      }
      begin(index, touch.y, offset - index * ROW);
      manager.activate();
    })
    .onUpdate((event) => move(event.y))
    .onFinalize(() => end());
}

/**
 * The swipe actions, what's under the rows, and the pool of mounted rows.
 * Nothing here changes with the queue, so a new order doesn't render it
 * again; each row follows its own slot.
 */
function UpNextRows({
  pool,
  slots,
  songs,
  values,
  swipe,
  width,
  onAction,
}: {
  pool: number;
  slots: QueueSlots;
  songs: ReadonlyMap<number, SongListItem>;
  values: QueueDragValues;
  swipe: QueueSwipeState;
  width: QueueGeometry["width"];
  onAction: (key: string, action: RowAction) => void;
}) {
  return (
    <>
      <SwipeActions
        side="trailing"
        swipe={swipe}
        width={width}
        orderProgress={values.orderProgress}
      />
      <SwipeActions
        side="leading"
        swipe={swipe}
        width={width}
        orderProgress={values.orderProgress}
      />
      <RowUnderlays swipe={swipe} />
      {Array.from({ length: pool }, (_, slot) => (
        <PooledRow
          key={slot}
          slot={slot}
          slots={slots}
          songs={songs}
          values={values}
          swipe={swipe}
          onAction={onAction}
        />
      ))}
    </>
  );
}

/**
 * One of the pool's rows: the entry its slot holds, if any. An entry that
 * just left Up Next (it's playing now) keeps its slot until the new order
 * reaches the UI thread, which hides it in the same frame the rest move up,
 * so no frame shows a gap.
 */
function PooledRow({
  slot,
  slots,
  songs,
  values,
  swipe,
  onAction,
}: {
  slot: number;
  slots: QueueSlots;
  songs: ReadonlyMap<number, SongListItem>;
  values: QueueDragValues;
  swipe: QueueSwipeState;
  onAction: (key: string, action: RowAction) => void;
}) {
  const key = useSyncExternalStore(slots.subscribe, () => slots.get(slot));
  const song = key === null ? undefined : songs.get(songIdOf(key));
  if (key === null || song === undefined) return null;
  return (
    <UpNextRow
      entryKey={key}
      song={song}
      values={values}
      swipe={swipe}
      onAction={onAction}
    />
  );
}
