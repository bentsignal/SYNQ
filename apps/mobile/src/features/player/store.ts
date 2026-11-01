import type { PlaybackStatus, RepeatMode } from "@synq/audio";

import type { Queue, QueueEntry } from "./queue-model";
import type { PlaybackSource } from "./types";
import { currentIndex, EMPTY_QUEUE } from "./queue-model";

/**
 * The player's state in JavaScript: the queue as entries of song ids (in
 * native's order), what it came from, shuffle and repeat, and what native
 * last said about playback. Read it in components through `usePlayer`.
 */
export interface PlayerState {
  readonly queue: Queue;
  /** The entry playing. */
  readonly current: QueueEntry | null;
  readonly source: PlaybackSource | null;
  readonly shuffle: boolean;
  readonly repeat: RepeatMode;
  readonly status: PlaybackStatus;
}

function playerState(fields: PlayerState) {
  return fields;
}

let state = playerState({
  current: null,
  queue: EMPTY_QUEUE,
  repeat: "off",
  shuffle: false,
  source: null,
  status: "idle",
});
const listeners = new Set<() => void>();

export function getPlayerState() {
  return state;
}

/** Updates the state; `current` follows the queue's current key. */
export function setPlayerState(next: Partial<Omit<PlayerState, "current">>) {
  const merged = { ...state, ...next };
  state = playerState({
    ...merged,
    current: merged.queue.entries[currentIndex(merged.queue)] ?? null,
  });
  for (const listener of listeners) listener();
}

let start: (() => void) | undefined;
let started = false;

/** Registers the player's startup (`startup.ts`), run on first use. */
export function onFirstUse(startPlayer: () => void) {
  start = startPlayer;
}

/** Restores the session and starts listening to native, once. */
export function ensureStarted() {
  if (started || start === undefined) return;
  started = true;
  start();
}

export function subscribePlayer(listener: () => void) {
  ensureStarted();
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export function isPlaying(status: PlaybackStatus) {
  return status === "playing" || status === "loading";
}
