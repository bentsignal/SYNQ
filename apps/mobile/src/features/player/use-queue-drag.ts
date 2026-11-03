import type { AnimatedRef } from "react-native-reanimated";
import type Animated from "react-native-reanimated";
import { useLayoutEffect, useRef, useState } from "react";
import {
  scrollTo,
  useFrameCallback,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import { scheduleOnRN, scheduleOnUI } from "react-native-worklets";

import type { QueueEntry } from "./queue-model";
import type { QueueGeometry } from "./use-queue-geometry";
import type { QueueSwipeState } from "./use-queue-swipe";
import { lightImpact, selectionTick } from "~/lib/haptics";
import { moveInUpNext } from "./commands";
import { autoScrollSpeed, positionsOf, slotAtOffset } from "./queue-layout";
import { QUEUE_ROW_HEIGHT as ROW } from "./queue-row";

/** How close to the list's edge a drag starts scrolling it. */
const SCROLL_EDGE = 72;
const LIFT_SCALE = 1.03;
const SETTLE = { duration: 160 };

const IDLE = 0;
const DRAGGING = 1;
const SETTLING = 2;

/**
 * A row's drag, on the UI thread. `positions` says where each entry is;
 * while dragging, `from` and `hover` say what's displaced (rows read both, so
 * they only do work when the hovered slot changes). A drop commits the move
 * in JavaScript, and `useQueueOrder` swaps in the new `positions` in the one
 * UI-thread call that clears the drag, so no frame shows the old order.
 */
export function useQueueDrag({
  entries,
  geometry,
  scrollRef,
  swipe,
}: {
  entries: readonly QueueEntry[];
  geometry: QueueGeometry;
  scrollRef: AnimatedRef<Animated.ScrollView>;
  swipe: QueueSwipeState;
}) {
  const { listTop, scrollY, scrollYIsDriven } = geometry;
  const [lifted, setLifted] = useState<QueueEntry | null>(null);
  const liftedKey = useRef<string | null>(null);
  const values = useDragValues(entries);
  const { floatY, floating, from, grabOffset, heldMs, hover } = values;
  const { fingerY, lift, phase } = values;
  const { autoScroll, placeFloating } = useDragFollow({
    geometry,
    scrollRef,
    values,
  });

  function letGo() {
    "worklet";
    phase.set(IDLE);
    scrollYIsDriven.set(false);
    from.set(-1);
    hover.set(-1);
    floating.set(false);
    scheduleOnRN(setLifted, null);
  }

  /** The dragged entry's index in `keys`; -1 ends the drag's scrolling. */
  function draggedIndex(keys: readonly string[]) {
    const index =
      liftedKey.current === null ? -1 : keys.indexOf(liftedKey.current);
    if (index === -1) {
      // There's no drag, or the dragged entry just started playing.
      liftedKey.current = null;
      autoScroll.setActive(false);
    }
    return index;
  }

  useQueueOrder({ draggedIndex, entries, geometry, letGo, swipe, values });

  function pickUp(index: number) {
    const entry = entries[index];
    if (entry === undefined) return;
    liftedKey.current = entry.key;
    setLifted(entry);
    autoScroll.setActive(true);
    lightImpact();
  }

  function drop(slot: number) {
    autoScroll.setActive(false);
    const key = liftedKey.current;
    liftedKey.current = null;
    if (key !== null && moveInUpNext(key, slot)) {
      selectionTick();
      return;
    }
    // Nothing moved, so no new positions are coming.
    scheduleOnUI(letGo);
  }

  function begin(index: number, y: number, grab: number) {
    "worklet";
    phase.set(DRAGGING);
    floating.set(false);
    scrollYIsDriven.set(true);
    from.set(index);
    hover.set(index);
    fingerY.set(y);
    grabOffset.set(grab);
    floatY.set(listTop.get() + index * ROW - scrollY.get());
    heldMs.set(0);
    lift.set(withTiming(LIFT_SCALE, SETTLE));
    scheduleOnRN(pickUp, index);
  }

  function move(y: number) {
    "worklet";
    if (phase.get() !== DRAGGING) return;
    fingerY.set(y);
    placeFloating(true);
  }

  function end() {
    "worklet";
    if (phase.get() !== DRAGGING) return;
    phase.set(SETTLING);
    scrollYIsDriven.set(false);
    lift.set(withTiming(1, SETTLE));
    const slot = hover.get();
    floatY.set(
      withTiming(listTop.get() + slot * ROW - scrollY.get(), SETTLE, () => {
        scheduleOnRN(drop, slot);
      }),
    );
  }

  function isIdle() {
    "worklet";
    return phase.get() === IDLE;
  }

  return { begin, end, isIdle, lifted, move, values };
}

function useDragValues(entries: readonly QueueEntry[]) {
  const [initial] = useState(() =>
    positionsOf(entries.map((entry) => entry.key)),
  );
  return {
    /** Rows are flying past, so they jump into place instead of sliding. */
    autoScrolling: useSharedValue(false),
    fingerY: useSharedValue(0),
    /** The floating copy's top, relative to the list's frame. */
    floatY: useSharedValue(0),
    /** The floating copy is drawn, so the dragged row can hide under it. */
    floating: useSharedValue(false),
    /** The dragged entry's index, or -1. */
    from: useSharedValue(-1),
    grabOffset: useSharedValue(0),
    /** How long the finger has been scrolling the list. */
    heldMs: useSharedValue(0),
    /** The slot it would land on, or -1. */
    hover: useSharedValue(-1),
    lift: useSharedValue(1),
    phase: useSharedValue(IDLE),
    /** Each entry's index in Up Next. */
    positions: useSharedValue(initial),
  };
}

export type QueueDragValues = ReturnType<typeof useDragValues>;

/** Keeps the floating copy under the finger, scrolling near the edges. */
function useDragFollow({
  geometry: { count, listTop, maxScroll, scrollY, topInset, viewportHeight },
  scrollRef,
  values: { autoScrolling, fingerY, floatY, grabOffset, heldMs, hover, phase },
}: {
  geometry: QueueGeometry;
  scrollRef: AnimatedRef<Animated.ScrollView>;
  values: QueueDragValues;
}) {
  function placeFloating(tick: boolean) {
    "worklet";
    const top = listTop.get() - scrollY.get();
    const finger = Math.min(
      Math.max(fingerY.get() - grabOffset.get(), topInset.get()),
      viewportHeight.get() - ROW,
    );
    const y = Math.min(Math.max(finger, top), top + (count.get() - 1) * ROW);
    floatY.set(y);
    const slot = slotAtOffset(y - top, ROW, count.get());
    if (slot === hover.get()) return;
    hover.set(slot);
    if (tick) scheduleOnRN(selectionTick);
  }

  const autoScroll = useFrameCallback((frame) => {
    if (phase.get() !== DRAGGING) {
      autoScrolling.set(false);
      return;
    }
    const velocity = autoScrollSpeed({
      bottom: viewportHeight.get(),
      edge: SCROLL_EDGE,
      fingerY: fingerY.get(),
      heldSeconds: heldMs.get() / 1000,
      top: topInset.get(),
    });
    autoScrolling.set(velocity !== 0);
    if (velocity === 0) {
      heldMs.set(0);
      return;
    }
    const elapsedMs = frame.timeSincePreviousFrame ?? 16;
    heldMs.set(heldMs.get() + elapsedMs);
    const delta = (velocity * elapsedMs) / 1000;
    const y = Math.min(
      Math.max(scrollY.get() + delta, -topInset.get()),
      maxScroll.get(),
    );
    if (y === scrollY.get()) return;
    scrollTo(scrollRef, 0, y, false);
    scrollY.set(y);
    // Rows fly past here, so no tick for each.
    placeFloating(false);
  }, false);

  return { autoScroll, placeFloating };
}

/**
 * Gives the UI thread each new order. A layout effect, so it has the order
 * with the rows' new content; there's no one event to hang this on, since the
 * queue also changes from native (a song ending) and from elsewhere in the
 * app.
 */
function useQueueOrder({
  draggedIndex,
  entries,
  geometry: { count },
  letGo,
  swipe,
  values: { from, hover, phase, positions },
}: {
  draggedIndex: (keys: readonly string[]) => number;
  entries: readonly QueueEntry[];
  geometry: QueueGeometry;
  letGo: () => void;
  swipe: QueueSwipeState;
  values: QueueDragValues;
}) {
  const { index: swipeIndex, x: swipeX } = swipe;
  useLayoutEffect(() => {
    const keys = entries.map((entry) => entry.key);
    const dragged = draggedIndex(keys);
    const next = positionsOf(keys);
    scheduleOnUI(() => {
      "worklet";
      positions.set(next);
      count.set(keys.length);
      swipeIndex.set(-1);
      swipeX.set(0);
      if (dragged !== -1 && phase.get() === DRAGGING) {
        // The song changed mid-drag: the same row, a place up.
        hover.set(
          Math.min(
            Math.max(hover.get() + dragged - from.get(), 0),
            keys.length - 1,
          ),
        );
        from.set(dragged);
      } else if (phase.get() !== IDLE) {
        letGo();
      }
    });
  }, [
    count,
    draggedIndex,
    entries,
    from,
    hover,
    letGo,
    phase,
    positions,
    swipeIndex,
    swipeX,
  ]);
}
