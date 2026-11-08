import type { RepeatMode } from "@synq/audio";
import * as Audio from "@synq/audio";

import type { PlaybackSource, PlayOptions } from "./types";
import { errorFeedback, lightImpact } from "~/lib/haptics";
import { forgetPushedTracks, native, tracksFor } from "./native-queue";
import { persist } from "./persistence";
import {
  buildQueue,
  cueEntry,
  cueSongs,
  currentIndex,
  forgetSongIds,
  moveEntry,
  removeEntries,
  shuffleQueue,
  unshuffleQueue,
  upNextMove,
  withCurrentKey,
} from "./queue-model";
import { recordPlay } from "./record-play";
import { songTapEffect } from "./song-tap";
import { addSongs, cachedSongs, loadSongs, setSongs } from "./songs";
import { ensureStarted, getPlayerState, setPlayerState } from "./store";

/**
 * Everything that changes playback. Each updates the JavaScript queue at
 * once (so the UI shows it on this frame), then makes the same change
 * natively, then saves the session.
 */

function chosenSong(songIds: readonly number[], options: PlayOptions) {
  return options.startIndex === undefined || options.shuffle === true
    ? undefined
    : songIds[options.startIndex];
}

function tapEffect(chosenSongId: number | undefined, source: PlaybackSource) {
  const state = getPlayerState();
  return songTapEffect({
    chosen:
      chosenSongId === undefined ? null : { songId: chosenSongId, source },
    current:
      state.current === null
        ? null
        : { songId: state.current.songId, source: state.source },
    status: state.status,
  });
}

/**
 * Plays `songIds` as the new queue. With `keepKey`, the key of the entry already
 * playing, that song carries on where it is instead of starting over.
 */
function replaceQueue(
  songIds: readonly number[],
  options: PlayOptions,
  keepKey: string | undefined,
) {
  const songs = loadSongs(songIds);
  const playable = songIds.filter((songId) => songs.has(songId));
  if (playable.length === 0) return;
  // The chosen song's place among the songs that still exist.
  const start = songIds
    .slice(0, options.startIndex ?? 0)
    .filter((songId) => songs.has(songId)).length;
  const shuffle = options.shuffle ?? getPlayerState().shuffle;
  const built = buildQueue(playable, {
    shuffle,
    startIndex: options.shuffle === true ? null : start,
  });
  const queue = keepKey === undefined ? built : withCurrentKey(built, keepKey);
  forgetPushedTracks();
  setSongs(songs);
  setPlayerState({ queue, shuffle, source: options.source });
  native(
    Audio.setQueue(tracksFor(queue.entries, songs), {
      play: true,
      ...(keepKey === undefined ? { positionMs: 0 } : {}),
      startIndex: currentIndex(queue),
    }),
  );
  persist();
  recordPlay(options.source, chosenSong(songIds, options));
}

/**
 * Replaces the queue with `songIds` (in the order shown) and plays. A tap on
 * the song that's already on doesn't restart it (`songTapEffect`).
 */
export function playSongs(songIds: readonly number[], options: PlayOptions) {
  ensureStarted();
  const chosenSongId = chosenSong(songIds, options);
  const effect = tapEffect(chosenSongId, options.source);
  if (effect === "start") {
    replaceQueue(songIds, options, undefined);
    return;
  }
  lightImpact();
  if (effect === "carry-on-with-new-list") {
    replaceQueue(songIds, options, getPlayerState().current?.key);
    return;
  }
  if (getPlayerState().status === "paused") native(Audio.play());
  recordPlay(options.source, chosenSongId);
}

function cue(songIds: readonly number[], place: "next" | "last") {
  ensureStarted();
  const songs = loadSongs(songIds);
  const { added, index, queue } = cueSongs(
    getPlayerState().queue,
    songIds.filter((songId) => songs.has(songId)),
    place,
  );
  if (added.length === 0) return;
  addSongs(songs);
  setPlayerState({ queue });
  native(Audio.insert(tracksFor(added, songs), index));
  persist();
}

/** Inserts songs directly after the current one, ahead of anything cued ("Play Next"). */
export function playNext(songIds: readonly number[]) {
  cue(songIds, "next");
}

/** Inserts songs after anything cued, ahead of the rest of the list ("Add to Queue"). */
export function addToQueue(songIds: readonly number[]) {
  cue(songIds, "last");
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

/**
 * Moves the Up Next entry `key` to the front of the cued run ("next") or to
 * its end ("last"): a swipe right in the queue.
 */
export function cueQueueEntry(key: string, place: "next" | "last") {
  const cued = cueEntry(getPlayerState().queue, key, place);
  if (cued === null) return false;
  setPlayerState({ queue: cued.queue });
  if (cued.from !== cued.to) native(Audio.move(cued.from, cued.to));
  persist();
  return true;
}

/** Removes the entry `key` (a swipe left in the queue). */
export function removeEntry(key: string) {
  const index = entryIndex(key);
  if (index === -1) return false;
  removeFromQueue([index]);
  return true;
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
