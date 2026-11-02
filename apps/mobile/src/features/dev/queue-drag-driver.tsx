import { useEffect } from "react";
import {
  Easing,
  useAnimatedReaction,
  useSharedValue,
  withDelay,
  withSequence,
  withTiming,
} from "react-native-reanimated";
import { scheduleOnUI } from "react-native-worklets";

import { setQueueDrive } from "./queue-drag-control";

/**
 * Development only: `synqDev.player.drag(index, toY, ms, holdMs)` runs a real
 * queue drag from the UI thread. Touches injected into a simulator stall
 * frames on their own (a plain scroll drops as many), so they can't measure
 * the list; this runs the same drag code with nothing else in the way.
 */
export interface QueueDragControls {
  /** Picks up the row at `index` with the finger at its middle; returns that y. */
  readonly begin: (index: number) => number;
  readonly move: (y: number) => void;
  readonly end: () => void;
}

export function QueueDragDriver({ begin, move, end }: QueueDragControls) {
  const y = useSharedValue(0);
  const driving = useSharedValue(false);

  useAnimatedReaction(
    () => y.get(),
    (next) => {
      if (driving.get()) move(next);
    },
  );

  // eslint-disable-next-line no-restricted-syntax -- development only: hands a module-level automation hook this mounted list's controls, for as long as it's mounted.
  useEffect(() => {
    setQueueDrive((index, toY, ms, holdMs) => {
      scheduleOnUI(() => {
        "worklet";
        const start = begin(index);
        y.set(start);
        driving.set(true);
        const travel = { duration: ms, easing: Easing.inOut(Easing.quad) };
        y.set(
          withSequence(
            withTiming(toY, travel),
            withDelay(
              holdMs,
              withTiming(toY, { duration: 1 }, () => {
                driving.set(false);
                end();
              }),
            ),
          ),
        );
      });
    });
    return () => setQueueDrive(null);
  }, [begin, driving, end, y]);

  return null;
}
