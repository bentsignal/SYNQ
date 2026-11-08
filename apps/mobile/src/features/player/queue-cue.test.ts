import assert from "node:assert/strict";
import { test } from "node:test";

import type { Queue } from "./queue-model.ts";
import {
  buildQueue,
  cueEntry,
  cueSongs,
  currentIndex,
  moveEntry,
  shuffleQueue,
  unshuffleQueue,
} from "./queue-model.ts";

/** After the current song: cued songs, then what would naturally play next. */

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
  return cueSongs(queue, songIds, "next").queue;
}

function addToQueue(queue: Queue, songIds: number[]) {
  return cueSongs(queue, songIds, "last").queue;
}

function cued(queue: Queue) {
  return queue.entries.flatMap((entry) => (entry.queued ? [entry.songId] : []));
}

function skipTo(queue: Queue, index: number) {
  return { ...queue, currentKey: queue.entries[index]?.key ?? null };
}

void test("Add to Queue goes ahead of the rest of the album that's playing", () => {
  const album = buildQueue([1, 2, 3, 4], { shuffle: false, startIndex: 0 });
  const { index, queue } = cueSongs(album, [10], "last");
  assert.equal(index, 1);
  assert.deepEqual(songs(queue), [1, 10, 2, 3, 4]);
  assert.equal(current(queue), 1);
});

void test("Add to Queue goes behind everything already cued", () => {
  let queue = buildQueue([1, 2, 3], { shuffle: false, startIndex: 0 });
  queue = addToQueue(queue, [10]);
  queue = addToQueue(queue, [11, 12]);
  assert.deepEqual(songs(queue), [1, 10, 11, 12, 2, 3]);
  queue = playNext(queue, [13]);
  queue = addToQueue(queue, [14]);
  assert.deepEqual(songs(queue), [1, 13, 10, 11, 12, 14, 2, 3]);
});

void test("Play Next goes directly after the current song, ahead of anything cued", () => {
  let queue = buildQueue([1, 2, 3], { shuffle: false, startIndex: 0 });
  queue = addToQueue(queue, [10]);
  queue = playNext(queue, [11]);
  assert.deepEqual(songs(queue), [1, 11, 10, 2, 3]);
  // The latest one is the one that plays next, not the first added.
  queue = playNext(queue, [12]);
  assert.deepEqual(songs(queue), [1, 12, 11, 10, 2, 3]);
});

void test("a whole album stays in order, either way", () => {
  const base = addToQueue(
    buildQueue([1, 2], { shuffle: false, startIndex: 0 }),
    [10],
  );
  assert.deepEqual(songs(playNext(base, [20, 21, 22])), [1, 20, 21, 22, 10, 2]);
  assert.deepEqual(
    songs(addToQueue(base, [20, 21, 22])),
    [1, 10, 20, 21, 22, 2],
  );
});

void test("the cued run follows the current song as it plays", () => {
  let queue = buildQueue([1, 2, 3], { shuffle: false, startIndex: 0 });
  queue = addToQueue(queue, [10, 11]);
  // Playing into the run, the rest of it is still ahead of new songs.
  queue = skipTo(queue, 1);
  queue = addToQueue(queue, [12]);
  assert.deepEqual(songs(queue), [1, 10, 11, 12, 2, 3]);
  queue = playNext(queue, [13]);
  assert.deepEqual(songs(queue), [1, 10, 13, 11, 12, 2, 3]);
  // Once past the run, new songs go right after the current one.
  queue = skipTo(queue, 5);
  assert.equal(current(queue), 2);
  queue = addToQueue(queue, [14]);
  assert.deepEqual(songs(queue), [1, 10, 13, 11, 12, 2, 14, 3]);
});

void test("songs added to an empty queue are the list, so shuffle reorders them", () => {
  const empty = buildQueue([], { shuffle: false, startIndex: null });
  const { index, queue } = cueSongs(empty, [1, 2, 3, 4, 5, 6], "last");
  assert.equal(index, 0);
  assert.equal(current(queue), 1);
  assert.deepEqual(cued(queue), []);
  const shuffledQueue = shuffleQueue(queue, seeded());
  assert.notDeepEqual(songs(shuffledQueue), [1, 2, 3, 4, 5, 6]);
});

void test("songs cued while shuffled go after the cued run and stay with the current song", () => {
  let queue = buildQueue([1, 2, 3, 4], {
    random: seeded(),
    shuffle: true,
    startIndex: 1,
  });
  const list = songs(queue);
  queue = playNext(queue, [9]);
  queue = addToQueue(queue, [10]);
  assert.deepEqual(songs(queue), [list[0], 9, 10, ...list.slice(1)]);
  // They aren't part of the list to come back to.
  queue = unshuffleQueue(queue);
  assert.deepEqual(songs(queue), [1, 2, 9, 10, 3, 4]);
  assert.equal(current(queue), 2);
});

void test("a song cued while shuffled doesn't play again when shuffle goes off", () => {
  let queue = buildQueue([1, 2, 3, 4], { shuffle: false, startIndex: 0 });
  queue = shuffleQueue(queue, () => 0);
  queue = addToQueue(queue, [9]);
  const after = songs(queue)[2];
  // 9 has played, and so has nothing else.
  queue = skipTo(queue, 2);
  assert.equal(current(queue), after);
  queue = unshuffleQueue(queue);
  const position = songs(queue).indexOf(9);
  assert.equal(current(queue), after);
  assert.ok(position < currentIndex(queue));
  assert.deepEqual(
    songs(queue).filter((song) => song !== 9),
    [1, 2, 3, 4],
  );
});

void test("shuffle on makes a cued song that already went by part of the list", () => {
  let queue = buildQueue([1, 2, 3, 4, 5, 6], { shuffle: false, startIndex: 0 });
  queue = addToQueue(queue, [10]);
  queue = skipTo(queue, 2);
  queue = shuffleQueue(queue, seeded());
  // Otherwise it could land right after the current song and read as cued.
  assert.deepEqual(cued(queue), []);
  queue = addToQueue(queue, [11]);
  assert.equal(queue.entries[1]?.songId, 11);
});

void test("a drop right after the current song cues the entry", () => {
  let queue = buildQueue([1, 2, 3, 4], { shuffle: false, startIndex: 0 });
  queue = moveEntry(queue, 3, 1);
  assert.deepEqual(songs(queue), [1, 4, 2, 3]);
  assert.deepEqual(cued(queue), [4]);
  queue = addToQueue(queue, [10]);
  assert.deepEqual(songs(queue), [1, 4, 10, 2, 3]);
});

void test("a drop in the cued run, down to its end, keeps the run unbroken", () => {
  const start = addToQueue(
    buildQueue([1, 2, 3, 4], { shuffle: false, startIndex: 0 }),
    [10, 11],
  );
  // Up Next is 10, 11, 2, 3, 4.
  const above = moveEntry(start, 4, 1);
  assert.deepEqual(cued(above), [3, 10, 11]);
  const inside = moveEntry(start, 4, 2);
  assert.deepEqual(cued(inside), [10, 3, 11]);
  const atEnd = moveEntry(start, 4, 3);
  assert.deepEqual(songs(atEnd), [1, 10, 11, 3, 2, 4]);
  assert.deepEqual(cued(atEnd), [10, 11, 3]);
  // Moving within the run keeps every song in it.
  assert.deepEqual(cued(moveEntry(start, 1, 2)), [11, 10]);
  for (const queue of [above, inside, atEnd]) {
    assert.equal(addToQueue(queue, [20]).entries[4]?.songId, 20);
  }
});

void test("a drop below the cued run returns the entry to the list", () => {
  let queue = addToQueue(
    buildQueue([1, 2, 3], { shuffle: false, startIndex: 0 }),
    [10, 11],
  );
  // Up Next is 10, 11, 2, 3. A song dragged far down mustn't pull new ones there.
  queue = moveEntry(queue, 1, 4);
  assert.deepEqual(songs(queue), [1, 11, 2, 3, 10]);
  assert.deepEqual(cued(queue), [11]);
  queue = addToQueue(queue, [12]);
  assert.deepEqual(songs(queue), [1, 11, 12, 2, 3, 10]);
  // Moving within the list stays in the list.
  const list = buildQueue([1, 2, 3, 4], { shuffle: false, startIndex: 0 });
  assert.deepEqual(cued(moveEntry(list, 3, 2)), []);
  assert.deepEqual(cued(moveEntry(list, 2, 3)), []);
});

void test("moving the current song leaves its flag alone", () => {
  const queue = buildQueue([1, 2, 3], { shuffle: false, startIndex: 0 });
  const moved = moveEntry(queue, 0, 2);
  assert.deepEqual(songs(moved), [2, 3, 1]);
  assert.deepEqual(cued(moved), []);
  assert.equal(current(moved), 1);
});

void test("dragging while shuffled: into the run it stays with the song, out of it it stays ahead", () => {
  let queue = buildQueue([1, 2, 3, 4, 5], { shuffle: false, startIndex: 0 });
  queue = shuffleQueue(queue, () => 0);
  queue = addToQueue(queue, [10]);
  const last = queue.entries.at(-1)?.songId ?? 0;
  // A list song dragged into the run stays there when shuffle goes off.
  const into = moveEntry(queue, queue.entries.length - 1, 1);
  assert.deepEqual(cued(into), [last, 10]);
  const rest = [1, 2, 3, 4, 5].filter((song) => song !== last && song !== 1);
  assert.deepEqual(songs(unshuffleQueue(into)), [1, last, 10, ...rest]);
  // A cued song dragged out isn't in the list, so it comes right after the run.
  const out = moveEntry(queue, 1, queue.entries.length - 1);
  assert.deepEqual(cued(out), []);
  assert.deepEqual(songs(unshuffleQueue(out)), [1, 10, 2, 3, 4, 5]);
});

function keyOf(queue: Queue, songId: number) {
  return queue.entries.find((entry) => entry.songId === songId)?.key ?? "";
}

function cueSwiped(queue: Queue, songId: number, place: "next" | "last") {
  return cueEntry(queue, keyOf(queue, songId), place)?.queue ?? queue;
}

void test("swiping a song in Up Next cues it, at the front or the back of the cued run", () => {
  let queue = buildQueue([1, 2, 3, 4, 5], { shuffle: false, startIndex: 0 });
  queue = addToQueue(queue, [10, 11]);
  queue = cueSwiped(queue, 4, "last");
  assert.deepEqual(songs(queue), [1, 10, 11, 4, 2, 3, 5]);
  assert.deepEqual(cued(queue), [10, 11, 4]);
  queue = cueSwiped(queue, 5, "next");
  assert.deepEqual(songs(queue), [1, 5, 10, 11, 4, 2, 3]);
  assert.deepEqual(cued(queue), [5, 10, 11, 4]);
  // A song already in the run moves within it.
  queue = cueSwiped(queue, 10, "last");
  assert.deepEqual(songs(queue), [1, 5, 11, 4, 10, 2, 3]);
  // The next Add to Queue still lands behind everything cued.
  queue = addToQueue(queue, [12]);
  assert.deepEqual(songs(queue), [1, 5, 11, 4, 10, 12, 2, 3]);
});

void test("swiping the song that's already next cues it without moving it", () => {
  const queue = buildQueue([1, 2, 3], { shuffle: false, startIndex: 0 });
  const result = cueEntry(queue, keyOf(queue, 2), "next");
  assert.ok(result);
  assert.equal(result.from, 1);
  assert.equal(result.to, 1);
  assert.deepEqual(cued(result.queue), [2]);
  // Already cued and in place: nothing to do.
  assert.equal(cueEntry(result.queue, keyOf(queue, 2), "last"), null);
});

void test("the current song and songs already played can't be cued", () => {
  const queue = skipTo(
    buildQueue([1, 2, 3], { shuffle: false, startIndex: 0 }),
    1,
  );
  assert.equal(cueEntry(queue, keyOf(queue, 2), "next"), null);
  assert.equal(cueEntry(queue, keyOf(queue, 1), "last"), null);
  assert.equal(cueEntry(queue, "missing", "last"), null);
});
