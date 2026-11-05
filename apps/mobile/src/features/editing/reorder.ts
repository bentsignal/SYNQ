/**
 * SwiftUI's `move(fromOffsets:toOffset:)`: moves the items at `from` so
 * they sit, in their order, before what was at `to` in the original list
 * (`to` may be the length, for the end). What `List.ForEach`'s `onMove`
 * reports.
 */
export function moveItems<Item>(
  items: readonly Item[],
  from: readonly number[],
  to: number,
) {
  const moving = new Set(from);
  const moved = items.filter((_, index) => moving.has(index));
  const rest = items.filter((_, index) => !moving.has(index));
  const insertAt = to - from.filter((index) => index < to).length;
  return [...rest.slice(0, insertAt), ...moved, ...rest.slice(insertAt)];
}
