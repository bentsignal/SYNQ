import type { RepeatMode } from "@synq/audio";
import * as Audio from "@synq/audio";

import type { PlayOptions } from "./types";
import { errorFeedback } from "~/lib/haptics";
import { forgetPushedTracks, native, tracksFor } from "./native-queue";
import { persist } from "./persistence";
import {
  buildQueue,
  currentIndex,
  forgetSongIds,
  insertEntries,
  moveEntry,
  newEntries,
  playNextIndex,
  removeEntries,
  shuffleQueue,
  unshuffleQueue,
  upNextMove,
} from "./queue-model";
import { recordPlay } from "./record-play";
import { addSongs, cachedSongs, loadSongs, setSongs } from "./songs";
import { ensureStarted, getPlayerState, setPlayerState } from "./store";

/**
 * Everything that changes playback. Each updates the JavaScript queue at
 * once (so the UI shows it on this frame), then makes the same change
 * natively, then saves the session.
 */

/** Replaces the queue with `songIds` (in the order shown) and plays. */
export function playSongs(songIds: readonly number[], options: PlayOptions) {
  ensureStarted();
  const songs = loadSongs(songIds);
  const playable = songIds.filter((songId) => songs.has(songId));
  if (playable.length === 0) return;
  // The chosen song's place among the songs that still exist.
  const start = songIds
    .slice(0, options.startIndex ?? 0)
    .filter((songId) => songs.has(songId)).length;
  const shuffle = options.shuffle ?? getPlayerState().shuffle;
  const queue = buildQueue(playable, {
    shuffle,
    startIndex: options.shuffle === true ? null : start,
  });
  forgetPushedTracks();
  setSongs(songs);
  setPlayerState({ queue, shuffle, source: options.source });
  native(
    Audio.setQueue(tracksFor(queue.entries, songs), {
      play: true,
      positionMs: 0,
      startIndex: currentIndex(queue),
    }),
  );
  persist();
  recordPlay(
    options.source,
    options.startIndex === undefined || options.shuffle === true
      ? undefined
      : songIds[options.startIndex],
  );
}

function insert(songIds: readonly number[], queued: boolean) {
  ensureStarted();
  const songs = loadSongs(songIds);
  const added = newEntries(
    songIds.filter((songId) => songs.has(songId)),
    queued,
  );
  if (added.length === 0) return;
  const { queue } = getPlayerState();
  const index = queued ? playNextIndex(queue) : queue.entries.length;
  addSongs(songs);
  setPlayerState({ queue: insertEntries(queue, added, index) });
  native(Audio.insert(tracksFor(added, songs), index));
  persist();
}

/** Inserts songs after the current one and any added this way before ("Play Next"). */
export function playNext(songIds: readonly number[]) {
  insert(songIds, true);
}

/** Appends songs to the end of the queue ("Add to Queue"). */
export function addToQueue(songIds: readonly number[]) {
  insert(songIds, false);
}

/** Removes queue entries by index. */
export function removeFromQueue(indices: readonly number[]) {
  if (indices.length === 0) return;
  const { queue, repeat } = getPlayerState();
  setPlayerState({ queue: removeEntries(queue, indices, repeat !== "off") });
  native(Audio.remove(indices));
  persist();
}

/** Drops deleted songs from the queue. */
export function forgetSongs(songIds: readonly number[]) {
  const { queue, repeat } = getPlayerState();
  removeFromQueue(
    forgetSongIds(queue, new Set(songIds), repeat !== "off").indices,
  );
}

/** Empties the queue, stopping playback (the library was erased). */
export function clearQueue() {
  removeFromQueue(getPlayerState().queue.entries.map((_, index) => index));
}

/** Removes everything after the current entry (the queue's Clear). */
export function clearUpNext() {
  const { queue } = getPlayerState();
  const index = currentIndex(queue);
  removeFromQueue(queue.entries.flatMap((_, i) => (i > index ? [i] : [])));
}

/** Moves the entry at `from` so it lands at `to` (both queue indices). */
export function moveInQueue(from: number, to: number) {
  if (from === to) return;
  setPlayerState({ queue: moveEntry(getPlayerState().queue, from, to) });
  native(Audio.move(from, to));
  persist();
}

/**
 * Puts the entry `key` at `upNextIndex` of Up Next (a drop in the queue).
 * Returns false when nothing moved.
 */
export function moveInUpNext(key: string, upNextIndex: number) {
  const move = upNextMove(getPlayerState().queue, key, upNextIndex);
  if (move === null) return false;
  moveInQueue(move.from, move.to);
  return true;
}

/** Removes the entry `key` (a swipe in the queue). */
export function removeEntry(key: string) {
  const index = entryIndex(key);
  if (index !== -1) removeFromQueue([index]);
}

/** Plays the entry `key` (a tap in the queue). */
export function playEntry(key: string) {
  const index = entryIndex(key);
  if (index !== -1) playQueueIndex(index);
}

function entryIndex(key: string) {
  return getPlayerState().queue.entries.findIndex((entry) => entry.key === key);
}

export function togglePlayback() {
  native(Audio.toggle());
}

/** The next song; at the end of the queue (repeat off) it buzzes, as in 2.5.2. */
export function skipToNext() {
  void Audio.next().then((moved) => {
    if (!moved) errorFeedback();
  });
}

/** Restarts the song after 3 seconds of it, else goes back one. */
export function skipToPrevious() {
  native(Audio.previous());
}

/** Resolves once native has the seek. */
export function seekTo(positionMs: number) {
  return Audio.seekTo(positionMs).catch(() => false);
}

/** Plays the entry at `index` (a tap in the queue). */
export function playQueueIndex(index: number) {
  const { queue } = getPlayerState();
  const entry = queue.entries[index];
  if (entry === undefined) return;
  setPlayerState({ queue: { ...queue, currentKey: entry.key } });
  native(Audio.skipTo(index));
  persist();
}

/**
 * Shuffle on: the rest of the queue in random order behind the current
 * song. Off: the original order around it. The song playing carries on
 * without a gap (native keeps an entry whose id is unchanged).
 */
export function toggleShuffle() {
  const state = getPlayerState();
  const shuffle = !state.shuffle;
  if (state.queue.entries.length === 0) {
    setPlayerState({ shuffle });
    persist();
    return;
  }
  const queue = shuffle
    ? shuffleQueue(state.queue)
    : unshuffleQueue(state.queue);
  setPlayerState({ queue, shuffle });
  native(
    Audio.setQueue(tracksFor(queue.entries, cachedSongs()), {
      startIndex: Math.max(0, currentIndex(queue)),
    }),
  );
  persist();
}

const NEXT_REPEAT = {
  all: "one",
  off: "all",
  one: "off",
} as const satisfies Record<RepeatMode, RepeatMode>;

/** Off → all → one → off, like Apple Music's button. */
export function cycleRepeat() {
  const repeat = NEXT_REPEAT[getPlayerState().repeat];
  setPlayerState({ repeat });
  native(Audio.setRepeatMode(repeat));
  persist();
}
