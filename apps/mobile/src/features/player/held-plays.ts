/**
 * Plays are written at once, except while they're held: then they wait, with
 * the time each happened, until they're released or flushed. The Library tab
 * holds them while it's on screen, so Recents doesn't reorder under someone's
 * finger (docs/rewrite.md → Home).
 */
export function createHeldPlays<Item>(
  write: (plays: readonly { item: Item; at: number }[]) => void,
) {
  let holding = false;
  let held = new Array<{ item: Item; at: number }>();
  function flush() {
    if (held.length === 0) return;
    const plays = held;
    held = [];
    write(plays);
  }
  function hold() {
    holding = true;
  }
  function record(item: Item, at: number) {
    if (holding) held.push({ at, item });
    else write([{ at, item }]);
  }
  function release() {
    holding = false;
    flush();
  }
  return { flush, hold, record, release };
}
