import assert from "node:assert/strict";
import { test } from "node:test";

import { applySongPick, createSongSelection } from "./song-selection.ts";

const songs = [{ id: 1 }, { id: 2 }, { id: 3 }];
const [a, b, c] = songs;

function addedIds(selection: ReturnType<typeof createSongSelection>) {
  return selection.pick().added.map((song) => song.id);
}

void test("adds songs in the order they were chosen", () => {
  assert.ok(a && b && c);
  const selection = createSongSelection();
  selection.toggle(c);
  selection.toggle(a);
  selection.choose(songs);
  assert.deepEqual(addedIds(selection), [3, 1, 2]);
  assert.equal(selection.size(), 3);
});

void test("a second tap unchooses", () => {
  assert.ok(a);
  const selection = createSongSelection();
  selection.toggle(a);
  assert.equal(selection.has(1), true);
  selection.toggle(a);
  assert.equal(selection.has(1), false);
  assert.equal(selection.size(), 0);
});

void test("all chosen is about the songs asked about", () => {
  assert.ok(a && b);
  const selection = createSongSelection();
  assert.equal(selection.allChosen([]), false);
  selection.choose([a, b]);
  assert.equal(selection.allChosen([a, b]), true);
  assert.equal(selection.allChosen(songs), false);
  selection.unchoose([a]);
  assert.equal(selection.allChosen([a, b]), false);
  assert.equal(selection.has(2), true);
});

void test("tells listeners until they unsubscribe", () => {
  assert.ok(a);
  const selection = createSongSelection();
  let calls = 0;
  const unsubscribe = selection.subscribe(() => {
    calls += 1;
  });
  selection.toggle(a);
  unsubscribe();
  selection.toggle(a);
  assert.equal(calls, 1);
});

void test("songs already there start chosen, and unchoosing removes them", () => {
  assert.ok(a && b);
  const selection = createSongSelection([2, 1]);
  assert.equal(selection.has(1), true);
  assert.equal(selection.size(), 2);
  selection.toggle(a);
  assert.deepEqual(selection.pick().kept, [2]);
  assert.deepEqual(selection.pick().added, []);
});

void test("a song taken off and put back keeps its place", () => {
  assert.ok(a && c);
  const selection = createSongSelection([1, 2]);
  selection.toggle(c);
  selection.toggle(a);
  selection.toggle(a);
  assert.deepEqual(selection.pick().kept, [1, 2]);
  assert.deepEqual(addedIds(selection), [3]);
});

void test("changes are what differs from when it opened", () => {
  assert.ok(a && c);
  const selection = createSongSelection([1, 2]);
  assert.equal(selection.hasChanges(), false);
  selection.toggle(a);
  assert.equal(selection.hasChanges(), true);
  selection.toggle(a);
  assert.equal(selection.hasChanges(), false);
  selection.toggle(c);
  assert.equal(selection.hasChanges(), true);
  selection.toggle(c);
  assert.equal(selection.hasChanges(), false);
});

void test("everything there can come off", () => {
  const selection = createSongSelection([1, 2, 3]);
  selection.unchoose(songs);
  assert.equal(selection.size(), 0);
  assert.deepEqual(selection.pick().kept, []);
  assert.equal(selection.hasChanges(), true);
});

void test("only the songs there when it opened are original", () => {
  assert.ok(c);
  const selection = createSongSelection([1]);
  selection.toggle(c);
  assert.equal(selection.isOriginal(1), true);
  assert.equal(selection.isOriginal(3), false);
});

void test("a pick keeps a sheet's order and adds to the end", () => {
  const rows = [{ key: "3" }, { key: "1" }, { key: "2" }];
  const result = applySongPick(
    rows,
    { added: [{ id: 9 }, { id: 8 }], kept: [1, 3] },
    (song) => ({ key: String(song.id) }),
  );
  assert.deepEqual(
    result.map((row) => row.key),
    ["3", "1", "9", "8"],
  );
});
