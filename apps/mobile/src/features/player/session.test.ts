import assert from "node:assert/strict";
import { test } from "node:test";

import type { Queue } from "./queue-model.ts";
import {
  buildQueue,
  cueSongs,
  currentIndex,
  moveEntry,
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
  positionMs: 56_000,
  repeat: "all",
  shuffle: true,
  source: { id: 4, kind: "album" },
} as const;

function songs(queue: Queue) {
  return queue.entries.map((entry) => entry.songId);
}

function playNext(queue: Queue, songIds: number[]) {
  return cueSongs(queue, songIds, "next").queue;
}

function addToQueue(queue: Queue, songIds: number[]) {
  return cueSongs(queue, songIds, "last").queue;
}

/** A session as stored JSON comes back from the kv store. */
function restore(stored: unknown) {
  const session = decodeSession(JSON.parse(JSON.stringify(stored)));
  assert.ok(session);
  return queueFromSession(session, () => true);
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
  queue = addToQueue(queue, [9]);
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

void test("a reordered queue comes back in its new order, on the same song", () => {
  let queue = buildQueue([5, 6, 7, 8], { shuffle: false, startIndex: 1 });
  queue = addToQueue(queue, [9]);
  // Up Next is 9 (cued), 7, 8; 8 goes first.
  queue = moveEntry(queue, 4, 2);
  assert.deepEqual(songs(queue), [5, 6, 8, 9, 7]);
  const { queue: restored, stored } = roundTrip(queue);
  assert.deepEqual(songs(restored), [5, 6, 8, 9, 7]);
  assert.equal(stored.index, 1);
  assert.equal(restored.entries[1]?.songId, 6);
  assert.equal(currentIndex(restored), 1);
  // The flag went with its entry, and the drop cued 8 ahead of it.
  assert.deepEqual(stored.queued, [2, 3]);
  assert.equal(restoredPosition(stored, restored), 56_000);
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

void test("a 2.5.2 session's added songs are the cued run after the update", () => {
  const session = sessionFromLegacy({
    likedPlaylistId: null,
    preferences: { repeat: "off", shuffle: false },
    session: {
      currentIndex: 1,
      insertOffset: 2,
      positionMs: 61_000,
      queueSongIds: [3, 4, 5, 6, 7, 8],
      source: { id: 2, kind: "album" },
    },
  });
  const queue = queueFromSession(session, () => true);
  assert.deepEqual(songs(queue), [3, 4, 5, 6, 7, 8]);
  assert.equal(currentIndex(queue), 1);
  assert.equal(restoredPosition(session, queue), 61_000);
  assert.deepEqual(songs(addToQueue(queue, [9])), [3, 4, 5, 6, 9, 7, 8]);
  assert.deepEqual(songs(playNext(queue, [9])), [3, 4, 9, 5, 6, 7, 8]);
  // Its shuffled order has no list to go back to, so it's kept.
  assert.deepEqual(songs(unshuffleQueue(queue)), [3, 4, 5, 6, 7, 8]);
});

void test("a session saved before Add to Queue cued songs keeps its order", () => {
  // Saved by the previous code: 10 with Play Next, 11 with Add to Queue, at the end.
  const queue = restore({
    index: 0,
    original: null,
    positionMs: 12_000,
    queued: [1],
    repeat: "off",
    shuffle: false,
    songIds: [1, 10, 2, 3, 11],
    source: { id: 4, kind: "album" },
  });
  assert.deepEqual(songs(queue), [1, 10, 2, 3, 11]);
  assert.equal(currentIndex(queue), 0);
  // 10 is the cued run; 11 can't be told from the list, so it stays last.
  assert.deepEqual(songs(addToQueue(queue, [12])), [1, 10, 12, 2, 3, 11]);
  assert.deepEqual(songs(playNext(queue, [12])), [1, 12, 10, 2, 3, 11]);
});

void test("a shuffled session saved before Add to Queue cued songs goes back to its list", () => {
  // Saved by the previous code: 11 was added with Add to Queue, so it's in the list.
  const queue = restore({
    index: 0,
    original: [3, 0, 2, 4],
    positionMs: 0,
    queued: [1],
    repeat: "off",
    shuffle: true,
    songIds: [2, 10, 3, 1, 11],
    source: null,
  });
  assert.deepEqual(songs(queue), [2, 10, 3, 1, 11]);
  assert.deepEqual(songs(unshuffleQueue(queue)), [1, 2, 10, 3, 11]);
});

void test("a stale flag in a saved session doesn't pull new songs down to it", () => {
  // The previous code shuffled played Play Next songs with their flag on.
  const queue = restore({
    index: 0,
    original: null,
    positionMs: 0,
    queued: [3],
    repeat: "off",
    shuffle: false,
    songIds: [1, 2, 3, 10, 4],
    source: null,
  });
  assert.deepEqual(songs(addToQueue(queue, [12])), [1, 12, 2, 3, 10, 4]);
});

void test("with no 2.5.2 session, its preferences still apply", () => {
  const session = sessionFromLegacy({
    likedPlaylistId: null,
    preferences: { repeat: "off", shuffle: true },
    session: null,
  });
  assert.equal(session.shuffle, true);
  assert.deepEqual(session.songIds, []);
  assert.equal(session.index, -1);
});
