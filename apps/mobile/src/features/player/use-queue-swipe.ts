import { Gesture } from "react-native-gesture-handler";
import {
  Easing,
  useSharedValue,
  withDelay,
  withSpring,
  withTiming,
} from "react-native-reanimated";
import { scheduleOnRN } from "react-native-worklets";

import type { QueueGeometry } from "./use-queue-geometry";
import { lightImpact } from "~/lib/haptics";
import { QUEUE_ROW_HEIGHT as ROW } from "./queue-row";
import { actionAt, fullDistance, openDistance } from "./swipe-layout";

/** Like a table view's: settles without bouncing. */
const SETTLE = { damping: 30, mass: 1, stiffness: 300 };
const SLIDE_OFF = { duration: 220 };
/** Closing before a move: quick, so the move follows the finger's release. */
const CLOSE_TO_MOVE = { duration: 200, easing: Easing.out(Easing.cubic) };
const ARM = { duration: 160 };
/** A touch that holds this long without moving shows the highlight. */
const HIGHLIGHT_DELAY = 90;
const UNHIGHLIGHT = { duration: 300 };
/** A touch this soon after the list moved only stops it, as in a table view. */
const SCROLL_SETTLE_MS = 120;
const FLING_VELOCITY = 1000;
/** Before measuring, roughly how wide each capsule is. */
const LEADING_GUESS = [140, 112];
const TRAILING_GUESS = [96];

export type CuePlace = "next" | "last";

/** The time, on the UI thread, when a touch or a scroll comes in. */
function nowMs() {
  "worklet";
  return Date.now();
}

/** Swiped right, outermost first: a full swipe adds to the queue. */
export const LEADING_ACTIONS = ["last", "next"] as const;

interface SwipeCallbacks {
  play: (index: number) => void;
  remove: (index: number) => void;
  cue: (index: number, place: CuePlace) => void;
}

/**
 * Every touch on Up Next's rows except a drag by the handle, as a table view
 * has them. A tap plays the row; the highlight waits a moment, so a touch
 * that becomes a scroll or a swipe never flashes. A swipe left opens Delete
 * and right opens Add to Queue and Play Next; swiping far does the first,
 * with a tap of haptics where letting go would.
 */
export function useQueueSwipe(
  geometry: QueueGeometry,
  callbacks: SwipeCallbacks,
) {
  const values = useSwipeValues();
  const motions = swipeMotions(values, geometry, callbacks);
  const { index, leadingWidths, scrolledAt, trailingWidths, x } = values;

  /** The list scrolled: a touch now only stops it, and an open row closes. */
  function onListScroll(dragging: boolean) {
    "worklet";
    scrolledAt.set(nowMs());
    if (dragging && index.get() !== -1 && x.get() !== 0) motions.close();
  }

  /** A capsule's measured width. */
  function measured(side: "leading" | "trailing", at: number, size: number) {
    const widths = side === "leading" ? leadingWidths : trailingWidths;
    const next = [...widths.get()];
    if (next[at] === size) return;
    next[at] = size;
    widths.set(next);
  }

  return {
    gestures: {
      pan: swipePan(values, geometry, motions),
      tap: rowTap(values, geometry, motions, callbacks.play),
    },
    measured,
    onListScroll,
    state: {
      armedProgress: values.armedProgress,
      close: motions.close,
      highlight: values.highlight,
      index,
      leadingWidths,
      pressIndex: values.pressIndex,
      reset: motions.reset,
      trailingWidths,
      x,
    },
  };
}

export type QueueSwipeState = ReturnType<typeof useQueueSwipe>["state"];

function useSwipeValues() {
  return {
    /** The row that's open or being swiped, or -1. */
    index: useSharedValue(-1),
    /** How far it's out: negative to the left, positive to the right. */
    x: useSharedValue(0),
    /** Where `x` was when this swipe started. */
    start: useSharedValue(0),
    /** Past the full-swipe point, where letting go acts: -1 left, 1 right. */
    armed: useSharedValue(0),
    /** `armed`, eased 0 → 1, for the first capsule to take over. */
    armedProgress: useSharedValue(0),
    leadingWidths: useSharedValue(LEADING_GUESS),
    trailingWidths: useSharedValue(TRAILING_GUESS),
    /** The row a touch is on, and its highlight. */
    pressIndex: useSharedValue(-1),
    highlight: useSharedValue(0),
    /** When the list last scrolled, in ms. */
    scrolledAt: useSharedValue(0),
  };
}

type SwipeValues = ReturnType<typeof useSwipeValues>;

/** Where a swiped row goes, on the UI thread. */
function swipeMotions(
  { armed, armedProgress, highlight, index, pressIndex, x }: SwipeValues,
  { width }: QueueGeometry,
  { cue, remove }: SwipeCallbacks,
) {
  function arm(value: number) {
    "worklet";
    if (armed.get() === value) return;
    armed.set(value);
    armedProgress.set(withTiming(value === 0 ? 0 : 1, ARM));
    if (value !== 0) scheduleOnRN(lightImpact);
  }

  /** Back to rest at once: the queue changed under the row. */
  function reset() {
    "worklet";
    index.set(-1);
    x.set(0);
    armed.set(0);
    armedProgress.set(0);
    pressIndex.set(-1);
    highlight.set(0);
  }

  function close() {
    "worklet";
    arm(0);
    x.set(
      withSpring(0, SETTLE, (finished) => {
        if (finished === true) index.set(-1);
      }),
    );
  }

  function open(distance: number) {
    "worklet";
    arm(0);
    x.set(withSpring(distance, SETTLE));
  }

  /** Slides the row back, then moves it: Add to Queue or Play Next. */
  function closeAndCue(row: number, place: CuePlace) {
    "worklet";
    x.set(
      withTiming(0, CLOSE_TO_MOVE, (finished) => {
        if (finished !== true) return;
        index.set(-1);
        arm(0);
        scheduleOnRN(cue, row, place);
      }),
    );
  }

  /** Slides the row off the screen, then deletes it. */
  function slideOffAndRemove(row: number) {
    "worklet";
    arm(-1);
    x.set(
      withTiming(-width.get(), SLIDE_OFF, (finished) => {
        if (finished !== true) return;
        arm(0);
        scheduleOnRN(remove, row);
      }),
    );
  }

  return { arm, close, closeAndCue, open, reset, slideOffAndRemove };
}

type SwipeMotions = ReturnType<typeof swipeMotions>;

/** A row follows a sideways drag, and settles where letting go leaves it. */
function swipePan(
  { armed, index, leadingWidths, start, trailingWidths, x }: SwipeValues,
  { count, listTop, scrollY, width }: QueueGeometry,
  { arm, close, closeAndCue, open, slideOffAndRemove }: SwipeMotions,
) {
  function settle(row: number, velocityX: number) {
    "worklet";
    const left = x.get() < 0;
    const distance = Math.abs(x.get());
    const opened = openDistance(
      left ? trailingWidths.get() : leadingWidths.get(),
    );
    const towardEdge = left ? -velocityX : velocityX;
    const flung = towardEdge > FLING_VELOCITY && distance > opened;
    if (armed.get() !== 0 || flung) {
      if (left) slideOffAndRemove(row);
      else closeAndCue(row, LEADING_ACTIONS[0]);
    } else if (distance > opened / 2 && towardEdge > -FLING_VELOCITY) {
      open(left ? -opened : opened);
    } else {
      close();
    }
  }

  return Gesture.Pan()
    .activeOffsetX([-12, 12])
    .failOffsetY([-10, 10])
    .onStart((event) => {
      const offset = event.y + scrollY.get() - listTop.get();
      const at = Math.floor(offset / ROW);
      const row = offset >= 0 && at < count.get() ? at : -1;
      start.set(row !== -1 && row === index.get() ? x.get() : 0);
      if (row !== index.get()) arm(0);
      index.set(row);
    })
    .onUpdate((event) => {
      if (index.get() === -1) return;
      const rowWidth = width.get();
      const value = Math.min(
        Math.max(start.get() + event.translationX, -rowWidth),
        rowWidth,
      );
      x.set(value);
      const widths = value < 0 ? trailingWidths.get() : leadingWidths.get();
      const past = Math.abs(value) > fullDistance(widths, rowWidth);
      arm(past ? Math.sign(value) : 0);
    })
    .onEnd((event) => {
      const row = index.get();
      if (row !== -1) settle(row, event.velocityX);
    });
}

/**
 * A tap plays a row, or with a row open, does the capsule under it or closes
 * the row. Moving more than a little makes it a scroll or a swipe instead.
 */
function rowTap(
  values: SwipeValues,
  { count, listTop, scrollY, width }: QueueGeometry,
  { close, closeAndCue, slideOffAndRemove }: SwipeMotions,
  play: (index: number) => void,
) {
  const { highlight, index, leadingWidths, pressIndex, scrolledAt } = values;
  const { trailingWidths, x } = values;

  function rowAt(y: number) {
    "worklet";
    const offset = y + scrollY.get() - listTop.get();
    const row = Math.floor(offset / ROW);
    return offset >= 0 && row < count.get() ? row : -1;
  }

  function tapOpenRow(row: number, tapX: number) {
    "worklet";
    const left = x.get() < 0;
    const action =
      row !== index.get()
        ? -1
        : left
          ? actionAt(trailingWidths.get(), width.get() - tapX)
          : actionAt(leadingWidths.get(), tapX);
    if (action === -1) close();
    else if (left) slideOffAndRemove(row);
    else closeAndCue(row, LEADING_ACTIONS[action] ?? "last");
  }

  return Gesture.Tap()
    .maxDistance(10)
    .maxDuration(60_000)
    .onBegin((event) => {
      const row = rowAt(event.y);
      const settling = nowMs() - scrolledAt.get() < SCROLL_SETTLE_MS;
      pressIndex.set(-1);
      if (row === -1 || index.get() !== -1 || settling) return;
      pressIndex.set(row);
      highlight.set(withDelay(HIGHLIGHT_DELAY, withTiming(1, { duration: 0 })));
    })
    .onEnd((event, succeeded) => {
      if (!succeeded) return;
      const row = rowAt(event.y);
      if (index.get() !== -1) {
        tapOpenRow(row, event.x);
        return;
      }
      if (row === -1 || pressIndex.get() !== row) return;
      // A quick tap still flashes, then fades.
      highlight.set(1);
      scheduleOnRN(play, row);
    })
    .onFinalize(() => {
      highlight.set(withTiming(0, UNHIGHLIGHT));
    });
}
