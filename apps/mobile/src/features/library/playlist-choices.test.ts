import assert from "node:assert/strict";
import { test } from "node:test";

import type { RowMark } from "./collection-row";
import { markOf, playlistChange, toggled } from "./playlist-choices.ts";

void test("a playlist is checked when it holds every song, mixed when some", () => {
  assert.equal(markOf(0, 3), "off");
  assert.equal(markOf(2, 3), "mixed");
  assert.equal(markOf(3, 3), "on");
});

void test("a mixed playlist checks first, then unchecks", () => {
  assert.equal(toggled("mixed"), "on");
  assert.equal(toggled("on"), "off");
  assert.equal(toggled("off"), "on");
});

void test("Done adds to checked playlists and removes from unchecked ones", () => {
  const start = new Map<number, RowMark>([
    [1, "on"],
    [2, "mixed"],
    [3, "off"],
    [4, "off"],
  ]);
  const chosen = new Map<number, RowMark>([
    [1, "off"],
    [2, "on"],
    [3, "on"],
    // Checked and unchecked again: nothing to write.
    [4, "off"],
  ]);
  assert.deepEqual(
    playlistChange((id) => start.get(id) ?? "off", chosen),
    { add: [2, 3], remove: [1] },
  );
});
