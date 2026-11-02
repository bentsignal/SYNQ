import assert from "node:assert/strict";
import { test } from "node:test";

import type { Queue } from "./queue-model.ts";
import {
  buildQueue,
  currentIndex,
  forgetSongIds,
  insertEntries,
  moveEntry,
  newEntries,
  playNextIndex,
  removeEntries,
  shuffled,
  shuffleQueue,
  unshuffleQueue,
  upNextMove,
} from "./queue-model.ts";

/** A repeatable "random" sequence. */
function seeded(seed = 7) {
  let state = seed;
  return () => {
    state = (state * 16807) % 2147483647;
    return (state - 1) / 2147483646;
  };
}

function songs(queue: Queue) {
  return queue.entries.map((entry) => entry.songId);
}

function current(queue: Queue) {
  return queue.entries[currentIndex(queue)]?.songId;
}

function playNext(queue: Queue, songIds: number[]) {
  return insertEntries(queue, newEntries(songIds, true), playNextIndex(queue));
}

function skipTo(queue: Queue, index: number) {
  return { ...queue, currentKey: queue.entries[index]?.key ?? null };
}

void test("a new queue plays in order from the chosen song", () => {
  const queue = buildQueue([1, 2, 3, 4], { shuffle: false, startIndex: 2 });
  assert.deepEqual(songs(queue), [1, 2, 3, 4]);
  assert.equal(current(queue), 3);
  assert.equal(queue.original, null);
  assert.equal(new Set(queue.entries.map((entry) => entry.key)).size, 4);
});

void test("shuffling keeps the chosen song first and every song once", () => {
  const queue = buildQueue([1, 2, 3, 4, 5, 6], {
    random: seeded(),
    shuffle: true,
    startIndex: 3,
  });
  assert.equal(currentIndex(queue), 0);
  assert.equal(current(queue), 4);
  assert.deepEqual([...songs(queue)].sort(), [1, 2, 3, 4, 5, 6]);
  assert.notDeepEqual(songs(queue), [4, 1, 2, 3, 5, 6]);
  assert.deepEqual(
    queue.original?.map(
      (key) => queue.entries.find((entry) => entry.key === key)?.songId,
    ),
    [1, 2, 3, 4, 5, 6],
  );
});

void test("Shuffle with no start song starts anywhere", () => {
  const queue = buildQueue([1, 2, 3], {
    random: seeded(3),
    shuffle: true,
    startIndex: null,
  });
  assert.equal(currentIndex(queue), 0);
  assert.equal(songs(queue).length, 3);
});

void test("Play Next stacks in the order songs were added, like 2.5.2", () => {
  let queue = buildQueue([1, 2, 3], { shuffle: false, startIndex: 0 });
  queue = playNext(queue, [10]);
  queue = playNext(queue, [11, 12]);
  assert.deepEqual(songs(queue), [1, 10, 11, 12, 2, 3]);
  // Playing into the stack, the rest still stacks behind it.
  queue = skipTo(queue, 1);
  queue = playNext(queue, [13]);
  assert.deepEqual(songs(queue), [1, 10, 11, 12, 13, 2, 3]);
  // Once past the stack, Play Next goes right after the current song.
  queue = skipTo(queue, 5);
  queue = playNext(queue, [14]);
  assert.deepEqual(songs(queue), [1, 10, 11, 12, 13, 2, 14, 3]);
});

void test("Add to Queue appends, and stays at the end when shuffle goes off", () => {
  let queue = buildQueue([1, 2, 3, 4], {
    random: seeded(),
    shuffle: true,
    startIndex: 1,
  });
  queue = insertEntries(queue, newEntries([9]), queue.entries.length);
  assert.equal(songs(queue).at(-1), 9);
  queue = unshuffleQueue(queue);
  assert.deepEqual(songs(queue), [1, 2, 3, 4, 9]);
  assert.equal(current(queue), 2);
});

void test("shuffle on then off restores the order around the current song", () => {
  let queue = buildQueue([1, 2, 3, 4, 5, 6], { shuffle: false, startIndex: 2 });
  queue = shuffleQueue(queue, seeded());
  assert.equal(currentIndex(queue), 0);
  assert.equal(current(queue), 3);
  // Play two more songs from the shuffled order.
  queue = skipTo(queue, 2);
  const playing = current(queue);
  queue = unshuffleQueue(queue);
  assert.deepEqual(songs(queue), [1, 2, 3, 4, 5, 6]);
  assert.equal(current(queue), playing);
  assert.equal(queue.original, null);
});

void test("shuffle keeps the Play Next run right after the current song", () => {
  let queue = buildQueue([1, 2, 3, 4, 5], { shuffle: false, startIndex: 0 });
  queue = playNext(queue, [10, 11]);
  queue = shuffleQueue(queue, seeded(11));
  assert.deepEqual(songs(queue).slice(0, 3), [1, 10, 11]);
  queue = unshuffleQueue(queue);
  assert.deepEqual(songs(queue), [1, 10, 11, 2, 3, 4, 5]);
});

void test("turning shuffle off while a Play Next song plays keeps it after the song before it", () => {
  let queue = buildQueue([1, 2, 3, 4], {
    random: () => 0,
    shuffle: true,
    startIndex: 0,
  });
  queue = skipTo(queue, 1);
  const before = current(queue) ?? 0;
  queue = playNext(queue, [20]);
  queue = skipTo(queue, 2);
  assert.equal(current(queue), 20);
  queue = unshuffleQueue(queue);
  assert.equal(current(queue), 20);
  const expected = [1, 2, 3, 4];
  expected.splice(expected.indexOf(before) + 1, 0, 20);
  assert.deepEqual(songs(queue), expected);
});

void test("removing the current entry moves to the one in its place", () => {
  const queue = buildQueue([1, 2, 3], { shuffle: false, startIndex: 1 });
  const removed = removeEntries(queue, [1], false);
  assert.deepEqual(songs(removed), [1, 3]);
  assert.equal(current(removed), 3);
  const last = removeEntries(skipTo(queue, 2), [2], false);
  assert.equal(current(last), 2);
  const wrapped = removeEntries(skipTo(queue, 2), [2], true);
  assert.equal(current(wrapped), 1);
  assert.deepEqual(removeEntries(queue, [0, 1, 2], false).entries, []);
});

void test("moves land at the target index", () => {
  const queue = buildQueue([1, 2, 3, 4], { shuffle: false, startIndex: 0 });
  assert.deepEqual(songs(moveEntry(queue, 1, 3)), [1, 3, 4, 2]);
  assert.deepEqual(songs(moveEntry(queue, 3, 1)), [1, 4, 2, 3]);
});

void test("an Up Next move lands where it was dropped and leaves the current song", () => {
  const queue = buildQueue([1, 2, 3, 4, 5], { shuffle: false, startIndex: 1 });
  function key(index: number) {
    return queue.entries[index]?.key ?? "";
  }
  assert.deepEqual(upNextMove(queue, key(4), 0), { from: 4, to: 2 });
  assert.deepEqual(upNextMove(queue, key(2), 2), { from: 2, to: 4 });
  const moved = moveEntry(queue, 4, 2);
  assert.deepEqual(songs(moved), [1, 2, 5, 3, 4]);
  assert.equal(moved.currentKey, queue.currentKey);
});

void test("an Up Next move stays in Up Next", () => {
  const queue = buildQueue([1, 2, 3, 4], { shuffle: false, startIndex: 1 });
  function key(index: number) {
    return queue.entries[index]?.key ?? "";
  }
  assert.deepEqual(upNextMove(queue, key(3), -5), { from: 3, to: 2 });
  assert.deepEqual(upNextMove(queue, key(2), 99), { from: 2, to: 3 });
});

void test("an Up Next move does nothing when there's nothing to move", () => {
  const queue = buildQueue([1, 2, 3], { shuffle: false, startIndex: 0 });
  function key(index: number) {
    return queue.entries[index]?.key ?? "";
  }
  assert.equal(upNextMove(queue, key(1), 0), null);
  assert.equal(upNextMove(queue, "gone", 0), null);
  // Native traps on a bad index, so one never gets that far.
  assert.equal(upNextMove(queue, key(1), Number.NaN), null);
  assert.equal(upNextMove(queue, key(1), 0.5), null);
  // The song ended mid-drag and the dragged entry is the one playing now.
  assert.equal(upNextMove(queue, key(0), 1), null);
  const advanced = { ...queue, currentKey: key(1) };
  assert.equal(upNextMove(advanced, key(1), 1), null);
  assert.equal(upNextMove(advanced, key(0), 1), null);
});

void test("moving while shuffled keeps the unshuffled order to come back to", () => {
  const queue = shuffleQueue(
    buildQueue([1, 2, 3, 4, 5], { shuffle: false, startIndex: 0 }),
  );
  const moved = moveEntry(queue, 1, 3);
  assert.deepEqual(moved.original, queue.original);
  assert.deepEqual(songs(unshuffleQueue(moved)), [1, 2, 3, 4, 5]);
});

void test("forgetting deleted songs removes every entry of them", () => {
  let queue = buildQueue([1, 2, 3], { shuffle: false, startIndex: 0 });
  queue = playNext(queue, [3]);
  const { indices, queue: forgotten } = forgetSongIds(
    queue,
    new Set([3]),
    false,
  );
  assert.deepEqual(indices, [1, 3]);
  assert.deepEqual(songs(forgotten), [1, 2]);
});

void test("shuffled returns a permutation", () => {
  const items = Array.from({ length: 50 }, (_, i) => i);
  const result = shuffled(items, seeded(5));
  assert.deepEqual(
    [...result].sort((a, b) => a - b),
    items,
  );
  assert.notDeepEqual(result, items);
});
