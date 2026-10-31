import assert from "node:assert/strict";
import { test } from "node:test";

import type { Queue } from "./queue-model.ts";
import {
  buildQueue,
  currentIndex,
  insertEntries,
  newEntries,
  playNextIndex,
  shuffleQueue,
  unshuffleQueue,
} from "./queue-model.ts";
import {
  decodeSession,
  EMPTY_SESSION,
  encodeSession,
  queueFromSession,
  restoredPosition,
  sessionFromLegacy,
} from "./session.ts";

const REST = {
  listenedMs: 1234,
  positionMs: 56_000,
  repeat: "all",
  shuffle: true,
  source: { id: 4, kind: "album" },
} as const;

function songs(queue: Queue) {
  return queue.entries.map((entry) => entry.songId);
}

function roundTrip(queue: Queue, exists = (_: number) => true) {
  const stored = decodeSession(
    JSON.parse(JSON.stringify(encodeSession(queue, REST))),
  );
  assert.ok(stored);
  return { queue: queueFromSession(stored, exists), stored };
}

void test("a session survives a round trip through storage", () => {
  let queue = buildQueue([5, 6, 7, 8], { shuffle: false, startIndex: 1 });
  queue = insertEntries(queue, newEntries([9], true), playNextIndex(queue));
  queue = shuffleQueue(queue, () => 0.5);
  const { queue: restored, stored } = roundTrip(queue);
  assert.deepEqual(songs(restored), songs(queue));
  assert.equal(currentIndex(restored), currentIndex(queue));
  assert.deepEqual(
    restored.entries.map((entry) => entry.queued),
    queue.entries.map((entry) => entry.queued),
  );
  assert.equal(stored.source?.kind, "album");
  assert.equal(stored.repeat, "all");
  assert.equal(restoredPosition(stored, restored), 56_000);
  // The unshuffled order comes back too.
  assert.deepEqual(songs(unshuffleQueue(restored)), [5, 6, 9, 7, 8]);
});

void test("songs deleted since are dropped; the position resets if the current one went", () => {
  const queue = buildQueue([1, 2, 3, 4], { shuffle: false, startIndex: 1 });
  const { queue: restored, stored } = roundTrip(queue, (id) => id !== 2);
  assert.deepEqual(songs(restored), [1, 3, 4]);
  assert.equal(restored.entries[currentIndex(restored)]?.songId, 3);
  assert.equal(restoredPosition(stored, restored), 0);
  const { queue: none } = roundTrip(queue, () => false);
  assert.equal(none.currentKey, null);
});

void test("garbage in storage decodes to safe values", () => {
  assert.equal(decodeSession(undefined), null);
  assert.equal(decodeSession("x"), null);
  assert.deepEqual(
    decodeSession({ index: 9, repeat: "sometimes", songIds: [1, "2", -3, 4] }),
    { ...EMPTY_SESSION, index: 1, songIds: [1, 4] },
  );
});

void test("a 2.5.2 session becomes the first 3.0 session", () => {
  const session = sessionFromLegacy({
    adThresholdMs: 600_000,
    ads: { due: false, listenedMs: 42_000 },
    likedPlaylistId: 7,
    preferences: { repeat: "all", shuffle: true },
    session: {
      currentIndex: 1,
      insertOffset: 2,
      positionMs: 61_000,
      queueSongIds: [3, 4, 5, 6, 7],
      source: { id: 7, kind: "playlist" },
    },
  });
  assert.deepEqual(session, {
    index: 1,
    listenedMs: 42_000,
    original: null,
    positionMs: 61_000,
    queued: [2, 3],
    repeat: "all",
    shuffle: true,
    songIds: [3, 4, 5, 6, 7],
    // 2.5.2's Liked Songs was a playlist; 3.0 names it as its own source.
    source: { kind: "liked" },
  });
});

void test("2.5.2's due ad stays due; no session keeps the preferences", () => {
  const session = sessionFromLegacy({
    adThresholdMs: 600_000,
    ads: { due: true, listenedMs: 3000 },
    likedPlaylistId: null,
    preferences: { repeat: "off", shuffle: true },
    session: null,
  });
  assert.equal(session.listenedMs, 600_000);
  assert.equal(session.shuffle, true);
  assert.deepEqual(session.songIds, []);
  assert.equal(session.index, -1);
});
