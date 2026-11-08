/**
 * Where a queue row's swipe actions are, as iOS 27 draws a table view's:
 * capsules beside the row, spaced from it, from each other, and from the
 * screen's edge. Pure, so node tests cover it; the UI thread runs it every
 * frame of a swipe. Distances are from the edge the row moved away from, and
 * actions go outermost first: the first is the one a full swipe does.
 */

export const ACTION_GAP = 10;
export const ACTION_HEIGHT = 36;
/** A full swipe needs at least this much past the open buttons. */
const FULL_BEYOND_OPEN = 32;
/** Or this share of the row, whichever is further. */
const FULL_SHARE = 0.55;

/** How far a row opens to show actions this wide. */
export function openDistance(widths: readonly number[]) {
  "worklet";
  let total = ACTION_GAP;
  for (const width of widths) total += width + ACTION_GAP;
  return total;
}

/** Past this, letting go does the first action. */
export function fullDistance(widths: readonly number[], rowWidth: number) {
  "worklet";
  return Math.max(
    rowWidth * FULL_SHARE,
    openDistance(widths) + FULL_BEYOND_OPEN,
  );
}

/**
 * Each action's capsule while the row is `revealed` points out: its outer end
 * (`start`, from the edge), length, opacity, and scale. Opening, they grow in
 * from small, spread over what's uncovered. Past open, the first stretches
 * with the finger and the others ride along beside the row. Armed (`armed`
 * easing 0 → 1), the first takes the whole space and the others fade.
 */
export function actionFrames(
  widths: readonly number[],
  revealed: number,
  armed: number,
) {
  "worklet";
  const open = openDistance(widths);
  const reveal = Math.min(Math.max(revealed / open, 0), 1);
  const extra = Math.max(revealed - open, 0);
  const scale = 0.5 + 0.5 * reveal;
  let offset = ACTION_GAP;
  return widths.map((width, index) => {
    const start = (offset + width / 2) * reveal - width / 2;
    offset += width + ACTION_GAP;
    if (index > 0) {
      return {
        length: width,
        opacity: reveal * (1 - armed),
        scale: scale * (1 - 0.3 * armed),
        start: start + extra,
      };
    }
    const length = width + extra;
    const full = Math.max(revealed - 2 * ACTION_GAP, ACTION_HEIGHT);
    return {
      length: length + (full - length) * armed,
      opacity: reveal,
      scale,
      start: start + (ACTION_GAP - start) * armed,
    };
  });
}

/** Which action of an open row is at `distance` from the edge, or -1. */
export function actionAt(widths: readonly number[], distance: number) {
  "worklet";
  let offset = ACTION_GAP;
  for (let index = 0; index < widths.length; index += 1) {
    const width = widths[index] ?? 0;
    // Half a gap either side counts, as a finger is wider than a gap.
    if (
      distance >= offset - ACTION_GAP / 2 &&
      distance < offset + width + ACTION_GAP / 2
    ) {
      return index;
    }
    offset += width + ACTION_GAP;
  }
  return -1;
}
