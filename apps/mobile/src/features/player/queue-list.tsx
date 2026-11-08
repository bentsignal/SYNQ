import type { ReactNode } from "react";
import type { LayoutChangeEvent } from "react-native";
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
import type { QueueDragValues } from "./use-queue-drag";
import type { QueueGeometry } from "./use-queue-geometry";
import type { QueueSwipeState } from "./use-queue-swipe";
import { env } from "~/env";
import { QueueDragDriver } from "~/features/dev/queue-drag-driver";
import {
  cueQueueEntry,
  moveInUpNext,
  playEntry,
  removeEntry,
} from "./commands";
import { FloatingRow, UpNextRow } from "./queue-list-rows";
import { songIdOf } from "./queue-model";
import { QUEUE_HANDLE_WIDTH, QUEUE_ROW_HEIGHT as ROW } from "./queue-row";
import { SwipeActions } from "./queue-swipe-actions";
import { useQueueDrag, useSlideNextOrder } from "./use-queue-drag";
import { useQueueGeometry } from "./use-queue-geometry";
import { useQueueSwipe } from "./use-queue-swipe";
import { useQueueWindow } from "./use-queue-window";

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
  const { act, gestures, measured, onListScroll, slideNextOrder, swipe } =
    useRowActions(entries, geometry);
  const { begin, end, isIdle, lifted, move, values } = useQueueDrag({
    entries,
    geometry,
    scrollRef,
    slideNextOrder,
    swipe,
  });
  const { onScrolled, slots } = useQueueWindow(entries, geometry);
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
                entries={entries}
                songs={songs}
                slots={slots}
                values={values}
                swipe={swipe}
                width={geometry.width}
                onMeasure={measured}
                onAction={act}
              />
            </View>
          )}
        </Animated.ScrollView>
        {(__DEV__ || env.profileBundle) && (
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
          song={lifted === null ? undefined : songs.get(lifted.songId)}
          entryKey={lifted?.key}
          values={values}
        />
      </View>
    </GestureDetector>
  );
}

/**
 * What a row's swipe, tap, or screen-reader action does. A row's action
 * marks the order it makes, so the rows slide into it.
 */
function useRowActions(
  entries: readonly QueueEntry[],
  geometry: QueueGeometry,
) {
  const slideNextOrder = useSlideNextOrder();

  function act(entry: QueueEntry | undefined, action: RowAction) {
    if (entry === undefined) return;
    // Set first: the queue's new order renders before these return.
    const moves = action !== "delete";
    slideNextOrder.mark({ moved: moves ? entry.key : null });
    const index = entries.indexOf(entry);
    const changed =
      action === "playNext" || action === "addToQueue"
        ? cueQueueEntry(entry.key, action === "playNext" ? "next" : "last")
        : action === "delete"
          ? removeEntry(entry.key)
          : moveInUpNext(entry.key, index + (action === "moveUp" ? -1 : 1));
    if (!changed) slideNextOrder.mark(null);
  }

  const {
    gestures,
    measured,
    onListScroll,
    state: swipe,
  } = useQueueSwipe(geometry, {
    cue: (index, place) =>
      act(entries[index], place === "next" ? "playNext" : "addToQueue"),
    play: (index) => {
      const entry = entries[index];
      if (entry !== undefined) playEntry(entry.key);
    },
    remove: (index) => act(entries[index], "delete"),
  });
  return { act, gestures, measured, onListScroll, slideNextOrder, swipe };
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

/** The swipe actions and the pool of mounted rows. */
function UpNextRows({
  entries,
  songs,
  slots,
  values,
  swipe,
  width,
  onMeasure,
  onAction,
}: {
  entries: readonly QueueEntry[];
  songs: ReadonlyMap<number, SongListItem>;
  slots: readonly (string | null)[];
  values: QueueDragValues;
  swipe: QueueSwipeState;
  width: QueueGeometry["width"];
  onMeasure: (side: "leading" | "trailing", at: number, size: number) => void;
  onAction: (entry: QueueEntry | undefined, action: RowAction) => void;
}) {
  const byKey = new Map(entries.map((entry) => [entry.key, entry]));
  return (
    <>
      <SwipeActions
        side="trailing"
        swipe={swipe}
        width={width}
        onMeasure={onMeasure}
      />
      <SwipeActions
        side="leading"
        swipe={swipe}
        width={width}
        onMeasure={onMeasure}
      />
      {slots.map((key, slot) => {
        if (key === null) return null;
        const entry = byKey.get(key);
        // An entry that just left Up Next (it's playing now) stays drawn
        // until the new order reaches the UI thread, which hides it in the
        // same frame the rest move up, so no frame shows a gap.
        const shown = entry ?? { key, queued: false, songId: songIdOf(key) };
        const song = songs.get(shown.songId);
        return song === undefined ? null : (
          <UpNextRow
            key={slot}
            entry={shown}
            song={song}
            values={values}
            swipe={swipe}
            onPlay={() => {
              if (entry !== undefined) playEntry(entry.key);
            }}
            onAction={(action) => onAction(entry, action)}
          />
        );
      })}
    </>
  );
}
