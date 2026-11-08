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
 *
 * When Up Next changes, the UI thread gets the new order a frame after the
 * new rows (`use-queue-drag.ts`). Until it does (`orderShown`), a row whose
 * song just left keeps its slot, so that frame shows the old list rather
 * than a gap where the song was, which flickered on every skip.
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
  const held = useHeldRows(entries, slots);
  const next = assignSlots(slots, keys, held.isHeld);
  if (next !== slots) setSlots(next);

  function onScrolled(y: number) {
    "worklet";
    const row = Math.floor((y - listTop.get()) / ROW);
    const step = Math.max(0, Math.floor(row / STEP) * STEP);
    if (step === lastStep.get()) return;
    lastStep.set(step);
    scheduleOnRN(setFirstRow, step);
  }

  return { onScrolled, orderShown: held.release, slots: next };
}

/** The rows whose songs just left Up Next, until the UI thread moves on. */
function useHeldRows(
  entries: readonly QueueEntry[],
  slots: readonly (string | null)[],
) {
  const [seen, setSeen] = useState(entries);
  const [held, setHeld] = useState<{
    entries: readonly QueueEntry[];
    present: ReadonlySet<string>;
  } | null>(null);
  let holding = held;
  if (seen !== entries) {
    // This same pass assigns the slots, so it holds at once.
    const present = new Set(entries.map((entry) => entry.key));
    const left = slots.some((key) => key !== null && !present.has(key));
    holding = left ? { entries, present } : null;
    setSeen(entries);
    setHeld(holding);
  }
  function isHeld(key: string) {
    return holding !== null && !holding.present.has(key);
  }
  /** The UI thread has the order of `shown`. */
  function release(shown: readonly QueueEntry[]) {
    setHeld((current) => (current?.entries === shown ? null : current));
  }
  return { isHeld, release };
}
