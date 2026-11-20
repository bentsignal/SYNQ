import assert from "node:assert/strict";
import { test } from "node:test";

import { createQueueSlots } from "./queue-slots.ts";

void test("rows hear about a new set of slots, and not the same one again", () => {
  const first = ["1.a", "2.b", null];
  const slots = createQueueSlots(first);
  let heard = 0;
  const stop = slots.subscribe(() => (heard += 1));
  assert.equal(slots.get(1), "2.b");
  assert.equal(slots.get(5), null);
  slots.set(first);
  assert.equal(heard, 0);
  slots.set(["1.a", "3.c", null]);
  assert.equal(heard, 1);
  assert.equal(slots.get(1), "3.c");
  stop();
  slots.set(["4.d", "3.c", null]);
  assert.equal(heard, 1);
});
