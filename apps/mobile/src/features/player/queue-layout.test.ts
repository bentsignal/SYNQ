import assert from "node:assert/strict";
import test from "node:test";

import {
  assignSlots,
  autoScrollSpeed,
  displacedSlot,
  MAX_AUTOSCROLL,
  positionsOf,
  slotAtOffset,
} from "./queue-layout.ts";

void test("a dragged row lands on the nearest slot, inside the list", () => {
  assert.equal(slotAtOffset(0, 60, 10), 0);
  assert.equal(slotAtOffset(29, 60, 10), 0);
  assert.equal(slotAtOffset(31, 60, 10), 1);
  assert.equal(slotAtOffset(-500, 60, 10), 0);
  assert.equal(slotAtOffset(5000, 60, 10), 9);
  assert.equal(slotAtOffset(100, 60, 0), 0);
});

/** The order shown while the row at `from` hovers over `hover`. */
function shown(items: readonly string[], from: number, hover: number) {
  const slots = items.map((_, base) => displacedSlot(base, from, hover));
  assert.equal(new Set(slots).size, items.length, "two rows in one slot");
  return items.map((_, slot) => items[slots.indexOf(slot)]);
}

void test("rows close the gap around a drag, with no two in one slot", () => {
  const items = ["a", "b", "c", "d", "e"];
  assert.deepEqual(shown(items, 1, 3), ["a", "c", "d", "b", "e"]);
  assert.deepEqual(shown(items, 3, 1), ["a", "d", "b", "c", "e"]);
  assert.deepEqual(shown(items, 2, 2), items);
  assert.deepEqual(shown(items, -1, -1), items);
});

void test("what a drag shows is the order a drop commits", () => {
  const items = ["a", "b", "c", "d", "e"];
  for (let from = 0; from < items.length; from += 1) {
    for (let to = 0; to < items.length; to += 1) {
      const moved = [...items];
      const [item] = moved.splice(from, 1);
      if (item !== undefined) moved.splice(to, 0, item);
      assert.deepEqual(shown(items, from, to), moved);
    }
  }
});

void test("a drag only scrolls near the edges, faster the deeper and longer", () => {
  const near = { bottom: 800, edge: 80, heldSeconds: 0, top: 100 };
  assert.equal(autoScrollSpeed({ ...near, fingerY: 400 }), 0);
  assert.ok(autoScrollSpeed({ ...near, fingerY: 150 }) < 0);
  assert.ok(autoScrollSpeed({ ...near, fingerY: 750 }) > 0);
  const shallow = autoScrollSpeed({ ...near, fingerY: 760 });
  const deep = autoScrollSpeed({ ...near, fingerY: 799 });
  assert.ok(deep > shallow);
  const held = autoScrollSpeed({ ...near, fingerY: 760, heldSeconds: 2 });
  assert.ok(held > shallow);
  assert.equal(
    autoScrollSpeed({ ...near, fingerY: 900, heldSeconds: 60 }),
    MAX_AUTOSCROLL,
  );
});

void test("positions are each key's index", () => {
  assert.deepEqual(positionsOf(["a", "b"]), { a: 0, b: 1 });
});

void test("keys in view keep their slots, and new ones take freed slots", () => {
  const slots = ["a", "b", "c", null];
  assert.equal(assignSlots(slots, ["a", "b", "c"]), slots);
  // A reorder is the same keys, so nothing is rebuilt.
  assert.equal(assignSlots(slots, ["c", "a", "b"]), slots);
  assert.deepEqual(assignSlots(slots, ["b", "c", "d"]), ["d", "b", "c", null]);
  assert.deepEqual(assignSlots(slots, ["b", "c", "d", "e"]), [
    "d",
    "b",
    "c",
    "e",
  ]);
  // A key that left stays in its slot until another needs it.
  assert.equal(assignSlots(slots, ["b"]), slots);
});
