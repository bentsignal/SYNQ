/**
 * The geometry behind the queue's list: pure, so node tests cover it. The
 * first three also run on the UI thread during a drag. A worklet captures
 * what it uses when it's defined, so constants go above them.
 */

/**
 * 30 rows a second. Faster, remounting rows starts to drop frames, so this
 * was measured (`scripts/sim.sh frames`), not chosen.
 */
export const MAX_AUTOSCROLL = 1800;

/** The up-next index a row at `offset` points into the list lands on. */
export function slotAtOffset(offset: number, rowHeight: number, count: number) {
  "worklet";
  const slot = Math.round(offset / rowHeight);
  return Math.min(Math.max(slot, 0), Math.max(count - 1, 0));
}

/**
 * Where the row at `base` shows while the row at `from` hovers over `hover`:
 * the dragged row takes the hovered slot, and the rows it passed close the
 * gap. With no drag (`from` of -1), every row stays at its own index.
 */
export function displacedSlot(base: number, from: number, hover: number) {
  "worklet";
  if (from < 0 || hover < 0) return base;
  if (base === from) return hover;
  if (base > from && base <= hover) return base - 1;
  if (base < from && base >= hover) return base + 1;
  return base;
}

/**
 * How fast a drag scrolls the list, in points a second: nothing away from
 * the edges, then faster the deeper the finger is and the longer it has
 * been there, up to `MAX_AUTOSCROLL`. Negative is up.
 */
export function autoScrollSpeed({
  fingerY,
  top,
  bottom,
  edge,
  heldSeconds,
}: {
  fingerY: number;
  top: number;
  bottom: number;
  edge: number;
  heldSeconds: number;
}) {
  "worklet";
  const above = top + edge - fingerY;
  const below = fingerY - (bottom - edge);
  const depth = Math.min(Math.max(above, below) / edge, 1);
  if (depth <= 0) return 0;
  const speed = (200 + 500 * depth * depth) * (1 + Math.min(heldSeconds, 3));
  return (above > below ? -1 : 1) * Math.min(speed, MAX_AUTOSCROLL);
}

/** Whether two orders are the same keys in the same order. */
export function sameKeys(a: readonly string[] | null, b: readonly string[]) {
  return (
    a !== null &&
    a.length === b.length &&
    a.every((key, index) => key === b[index])
  );
}

/** Each entry's index, for the UI thread to place rows by. */
export function positionsOf(keys: readonly string[]) {
  return Object.fromEntries(keys.map((key, index) => [key, index]));
}

/**
 * Hands the rows in view to a fixed pool of mounted rows. A key already in a
 * slot stays there, so a reorder rebuilds nothing, and each key that scrolled
 * in takes the slot of one that left. A key in `held` keeps its slot too, so
 * a row that just left stays drawn; a key with no slot free waits. Returns
 * `slots` itself when nothing changed.
 */
export function assignSlots(
  slots: readonly (string | null)[],
  keys: readonly string[],
  held: (key: string) => boolean = () => false,
) {
  const wanted = new Set(keys);
  const placed = new Set(slots);
  const incoming = keys.filter((key) => !placed.has(key));
  if (incoming.length === 0) return slots;
  let next = 0;
  const assigned = slots.map((slot) => {
    if (slot !== null && (wanted.has(slot) || held(slot))) return slot;
    const key = incoming[next];
    if (key === undefined) return slot;
    next += 1;
    return key;
  });
  return next === 0 ? slots : assigned;
}

/** Further than this, a row settling into a new order jumps there. */
const MAX_SETTLE_SLIDE = 12;
/** With a moved row: it fades out, then the rest slide, then it fades in. */
const FADE_OUT_END = 0.25;
const FADE_IN_START = 0.75;

/** How far rows settling into a new order have gone, at `t` of the way. */
export function easeInOut(t: number) {
  "worklet";
  return t < 0.5 ? 4 * t * t * t : 1 - (-2 * t + 2) ** 3 / 2;
}

/**
 * Where a row shows, and how visible, while Up Next settles into the order a
 * row's action made (`progress` 0 → 1, linear). Rows slide from their old
 * slots. The row that moved (`isMoved`, when one did) never slides over the
 * rest: it fades out where it was, the rest close and open the gaps, then it
 * fades in where it landed.
 */
export function settlingRow({
  slot,
  previous,
  progress,
  isMoved,
  anyMoved,
}: {
  slot: number;
  previous: number | undefined;
  progress: number;
  isMoved: boolean;
  anyMoved: boolean;
}) {
  "worklet";
  if (progress >= 1 || previous === undefined) return { opacity: 1, slot };
  if (isMoved) {
    if (progress < FADE_OUT_END) {
      return { opacity: 1 - progress / FADE_OUT_END, slot: previous };
    }
    const shown = (progress - FADE_IN_START) / (1 - FADE_IN_START);
    return { opacity: Math.max(shown, 0), slot };
  }
  if (Math.abs(previous - slot) > MAX_SETTLE_SLIDE) return { opacity: 1, slot };
  const sliding = anyMoved
    ? (progress - FADE_OUT_END) / (FADE_IN_START - FADE_OUT_END)
    : progress;
  const eased = easeInOut(Math.min(Math.max(sliding, 0), 1));
  return { opacity: 1, slot: previous + (slot - previous) * eased };
}
