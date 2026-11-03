import { useState } from "react";
import { useWindowDimensions } from "react-native";
import { useSharedValue } from "react-native-reanimated";
import { scheduleOnRN } from "react-native-worklets";

import type { QueueEntry } from "./queue-model";
import type { QueueGeometry } from "./use-queue-geometry";
import { assignSlots } from "./queue-layout";
import { QUEUE_ROW_HEIGHT as ROW } from "./queue-row";

/** How far past the screen, in points, rows stay mounted. */
const OVERSCAN = 900;
/** The mounted window moves in steps this many rows, not on every row. */
const STEP = 4;

/**
 * Which entries the mounted rows show: a fixed pool around the screen, so
 * scrolling reuses rows, and `onScroll` only reaches React every few rows.
 */
export function useQueueWindow(
  entries: readonly QueueEntry[],
  { listTop }: QueueGeometry,
) {
  const { height } = useWindowDimensions();
  const [firstRow, setFirstRow] = useState(0);
  const lastStep = useSharedValue(0);
  const poolSize = Math.ceil((height + 2 * OVERSCAN) / ROW) + STEP;
  const start = Math.max(0, firstRow - Math.floor(OVERSCAN / ROW));
  const keys = entries.slice(start, start + poolSize).map((entry) => entry.key);
  const [slots, setSlots] = useState(() =>
    assignSlots(
      Array.from({ length: poolSize }, () => null),
      keys,
    ),
  );
  const next = assignSlots(slots, keys);
  if (next !== slots) setSlots(next);

  function onScrolled(y: number) {
    "worklet";
    const row = Math.floor((y - listTop.get()) / ROW);
    const step = Math.max(0, Math.floor(row / STEP) * STEP);
    if (step === lastStep.get()) return;
    lastStep.set(step);
    scheduleOnRN(setFirstRow, step);
  }

  return { onScrolled, slots: next };
}
