import { Gesture } from "react-native-gesture-handler";
import { useSharedValue, withTiming } from "react-native-reanimated";
import { scheduleOnRN } from "react-native-worklets";

import type { QueueGeometry } from "./use-queue-geometry";
import { QUEUE_ROW_HEIGHT as ROW } from "./queue-row";

const SETTLE = { duration: 200 };
/** How far a partial swipe leaves the row open, showing Delete. */
export const SWIPE_OPEN = 88;
/** Past this share of the row, letting go deletes without the tap. */
const DELETE_SHARE = 0.55;
const DELETE_VELOCITY = -1500;

/** Swiping a row left: opens it on Delete, or deletes it when swiped far. */
export function useQueueSwipe(
  { count, listTop, scrollY, width }: QueueGeometry,
  remove: (index: number) => void,
) {
  const index = useSharedValue(-1);
  const x = useSharedValue(0);
  const start = useSharedValue(0);

  function close() {
    "worklet";
    x.set(
      withTiming(0, SETTLE, (finished) => {
        if (finished === true) index.set(-1);
      }),
    );
  }

  const gesture = Gesture.Pan()
    .activeOffsetX(-14)
    .failOffsetY([-12, 12])
    .onStart((event) => {
      const offset = event.y + scrollY.get() - listTop.get();
      const row = Math.floor(offset / ROW);
      start.set(row === index.get() ? x.get() : 0);
      index.set(offset >= 0 && row < count.get() ? row : -1);
    })
    .onUpdate((event) => {
      if (index.get() === -1) return;
      x.set(Math.min(0, start.get() + event.translationX));
    })
    .onEnd((event) => {
      const row = index.get();
      if (row === -1) return;
      const flung = event.velocityX < DELETE_VELOCITY && x.get() < -SWIPE_OPEN;
      if (x.get() < -width.get() * DELETE_SHARE || flung) {
        x.set(
          withTiming(-width.get(), SETTLE, (finished) => {
            if (finished === true) scheduleOnRN(remove, row);
          }),
        );
      } else if (x.get() < -SWIPE_OPEN / 2) {
        x.set(withTiming(-SWIPE_OPEN, SETTLE));
      } else {
        close();
      }
    });

  return { gesture, state: { close, index, x } };
}

export type QueueSwipeState = ReturnType<typeof useQueueSwipe>["state"];
