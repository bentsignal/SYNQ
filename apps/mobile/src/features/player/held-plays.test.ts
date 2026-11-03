import assert from "node:assert/strict";
import { test } from "node:test";

import { createHeldPlays } from "./held-plays.ts";

function recorder() {
  const writes = new Array<{ item: string; at: number }[]>();
  const plays = createHeldPlays<string>((batch) => writes.push([...batch]));
  return { plays, writes };
}

void test("a play is written at once when nothing's holding it", () => {
  const { plays, writes } = recorder();
  plays.record("album", 1);
  assert.deepEqual(writes, [[{ at: 1, item: "album" }]]);
});

void test("held plays wait, and keep the time they happened, in order", () => {
  const { plays, writes } = recorder();
  plays.hold();
  plays.record("album", 1);
  plays.record("song", 2);
  assert.deepEqual(writes, []);
  plays.release();
  assert.deepEqual(writes, [
    [
      { at: 1, item: "album" },
      { at: 2, item: "song" },
    ],
  ]);
});

void test("after release, plays are written at once again", () => {
  const { plays, writes } = recorder();
  plays.hold();
  plays.release();
  plays.record("album", 1);
  assert.equal(writes.length, 1);
});

void test("flush saves what's held and keeps holding, as when the app leaves the screen", () => {
  const { plays, writes } = recorder();
  plays.hold();
  plays.record("album", 1);
  plays.flush();
  assert.equal(writes.length, 1);
  plays.record("song", 2);
  assert.equal(writes.length, 1);
});

void test("nothing held writes nothing", () => {
  const { plays, writes } = recorder();
  plays.hold();
  plays.release();
  plays.flush();
  assert.deepEqual(writes, []);
});
