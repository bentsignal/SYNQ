/**
 * Whether `next` is `previous` with items added: everything in `previous` is
 * still there, in the same order. That's what a batch of new songs does to a
 * sorted list, and what must not move what someone is looking at. A new sort
 * or a search isn't, so a list that changes that way is free to move.
 */
export function isInsertionOnly<Item>(
  previous: readonly Item[],
  next: readonly Item[],
  key: (item: Item, index: number) => string,
) {
  if (next.length < previous.length) return false;
  let found = 0;
  for (let index = 0; index < next.length; index += 1) {
    const nextItem = next[index];
    const expected = previous[found];
    if (expected === undefined || nextItem === undefined) break;
    if (key(nextItem, index) === key(expected, found)) found += 1;
  }
  return found === previous.length;
}
