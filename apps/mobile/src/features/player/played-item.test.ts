import assert from "node:assert/strict";
import { test } from "node:test";

import { playedItem } from "./played-item.ts";

void test("a collection stands for itself, whichever song started it", () => {
  assert.deepEqual(playedItem({ id: 4, kind: "album" }, 9), {
    id: 4,
    kind: "album",
  });
  assert.deepEqual(playedItem({ id: 5, kind: "artist" }, undefined), {
    id: 5,
    kind: "artist",
  });
  assert.deepEqual(playedItem({ id: 6, kind: "playlist" }, 9), {
    id: 6,
    kind: "playlist",
  });
  assert.deepEqual(playedItem({ kind: "liked" }, 9), { kind: "liked" });
});

void test("from the library or a search, it's the song someone chose", () => {
  assert.deepEqual(playedItem({ kind: "library" }, 9), { id: 9, kind: "song" });
  assert.deepEqual(playedItem({ kind: "search" }, 9), { id: 9, kind: "song" });
});

void test("Play or Shuffle on all of Songs chooses nothing", () => {
  assert.equal(playedItem({ kind: "library" }, undefined), null);
});
