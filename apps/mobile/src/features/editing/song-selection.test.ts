import assert from "node:assert/strict";
import { test } from "node:test";

import { createSongSelection } from "./song-selection.ts";

const songs = [{ id: 1 }, { id: 2 }, { id: 3 }];
const [a, b, c] = songs;

void test("keeps songs in the order they were chosen", () => {
  assert.ok(a && b && c);
  const selection = createSongSelection();
  selection.toggle(c);
  selection.toggle(a);
  selection.choose(songs);
  assert.deepEqual(
    selection.songs().map((song) => song.id),
    [3, 1, 2],
  );
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
