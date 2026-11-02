import type { ReactNode } from "react";
import type { LayoutChangeEvent } from "react-native";
import { View } from "react-native";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import Animated, {
  useAnimatedRef,
  useAnimatedScrollHandler,
} from "react-native-reanimated";

import type { SongListItem } from "@synq/db";

import type { QueueEntry } from "./queue-model";
import type { QueueDragValues } from "./use-queue-drag";
import type { QueueGeometry } from "./use-queue-geometry";
import type { QueueSwipeState } from "./use-queue-swipe";
import { env } from "~/env";
import { QueueDragDriver } from "~/features/dev/queue-drag-driver";
import { moveInUpNext, playEntry, removeEntry } from "./commands";
import { FloatingRow, SwipeBackground, UpNextRow } from "./queue-list-rows";
import { QUEUE_HANDLE_WIDTH, QUEUE_ROW_HEIGHT as ROW } from "./queue-row";
import { useQueueDrag } from "./use-queue-drag";
import { useQueueGeometry } from "./use-queue-geometry";
import { SWIPE_OPEN, useQueueSwipe } from "./use-queue-swipe";
import { useQueueWindow } from "./use-queue-window";

/**
 * Up Next, drawn by hand so a reorder costs nothing however long the queue
 * is (`README.md`, Reordering the queue). One pan on the list handles every
 * row: a touch on the handle's side picks the row up at once, and a swipe
 * left anywhere else opens or deletes it.
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
  const { gesture: swipeGesture, state: swipe } = useQueueSwipe(
    geometry,
    (index) => {
      const entry = entries[index];
      if (entry !== undefined) removeEntry(entry.key);
    },
  );
  const { begin, end, isIdle, lifted, move, values } = useQueueDrag({
    entries,
    geometry,
    scrollRef,
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

  const onScroll = useListScroll(geometry, onScrolled);

  function onFrame(event: LayoutChangeEvent) {
    viewportHeight.set(event.nativeEvent.layout.height);
    width.set(event.nativeEvent.layout.width);
  }

  return (
    <GestureDetector gesture={Gesture.Exclusive(reorder, swipeGesture)}>
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

function useListScroll(
  { maxScroll, scrollY, scrollYIsDriven, topInset }: QueueGeometry,
  onScrolled: (y: number) => void,
) {
  return useAnimatedScrollHandler((event) => {
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
    onScrolled(contentOffset.y);
  });
}

function useReorderGesture({
  begin,
  end,
  geometry: { count, listTop, scrollY, width },
  isIdle,
  move,
  swipe: { close, index: swipeIndex },
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
      const open = swipeIndex.get();
      if (open !== -1) {
        // Delete takes this touch; anywhere else it only closes the row.
        if (index !== open || touch.x < width.get() - SWIPE_OPEN) close();
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

/** The swipe background and the pool of mounted rows. */
function UpNextRows({
  entries,
  songs,
  slots,
  values,
  swipe,
  width,
}: {
  entries: readonly QueueEntry[];
  songs: ReadonlyMap<number, SongListItem>;
  slots: readonly (string | null)[];
  values: QueueDragValues;
  swipe: QueueSwipeState;
  width: QueueGeometry["width"];
}) {
  const byKey = new Map(
    entries.map((entry, index) => [entry.key, { entry, index }]),
  );
  return (
    <>
      <SwipeBackground
        swipe={swipe}
        width={width}
        onPress={() => {
          const entry = entries[swipe.index.get()];
          if (entry !== undefined) removeEntry(entry.key);
        }}
      />
      {slots.map((key, slot) => {
        const found = key === null ? undefined : byKey.get(key);
        const song =
          found === undefined ? undefined : songs.get(found.entry.songId);
        return found === undefined || song === undefined ? null : (
          <UpNextRow
            key={slot}
            entry={found.entry}
            song={song}
            values={values}
            swipe={swipe}
            onPress={() => {
              if (swipe.index.get() === -1) playEntry(found.entry.key);
            }}
            onMove={(delta) =>
              moveInUpNext(found.entry.key, found.index + delta)
            }
            onRemove={() => removeEntry(found.entry.key)}
          />
        );
      })}
    </>
  );
}
