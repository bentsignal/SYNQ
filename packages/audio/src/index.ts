import { useSyncExternalStore } from "react";
import { NativeModule, requireNativeModule } from "expo";

import type {
  AudioEventName,
  AudioEvents,
  InterstitialConfig,
  PlaybackState,
  Progress,
  RepeatMode,
  SetQueueOptions,
  Track,
} from "./types.ts";
import { createSnapshotStore } from "./store.ts";

export type * from "./types.ts";
export {
  RoutePickerButton,
  type RoutePickerButtonProps,
} from "./route-picker.tsx";

declare class SynqAudioModule extends NativeModule<AudioEvents> {
  setQueue(tracks: readonly Track[], options: SetQueueOptions): Promise<void>;
  insert(tracks: readonly Track[], index: number | null): Promise<void>;
  remove(indices: readonly number[]): Promise<void>;
  move(from: number, to: number): Promise<void>;
  play(): Promise<void>;
  pause(): Promise<void>;
  toggle(): Promise<void>;
  seekTo(positionMs: number): Promise<boolean>;
  next(): Promise<boolean>;
  previous(): Promise<boolean>;
  skipTo(index: number): Promise<boolean>;
  setRepeatMode(mode: RepeatMode): Promise<void>;
  configureInterstitial(config: InterstitialConfig | null): Promise<void>;
  getState(): Promise<PlaybackState>;
  getQueue(): Promise<{ tracks: Track[]; index: number | null }>;
}

const native = requireNativeModule<SynqAudioModule>("SynqAudio");

/**
 * Replaces the queue. If the track at `startIndex` is the one playing (same
 * id), it keeps playing without a gap; use this to apply a new shuffle order.
 */
export function setQueue(
  tracks: readonly Track[],
  options: SetQueueOptions = {},
) {
  return native.setQueue(tracks, options);
}

/** Inserts before `index` (default: the end). The current track keeps playing. */
export function insert(tracks: readonly Track[], index?: number) {
  return native.insert(tracks, index ?? null);
}

/** Removes entries. Removing the current one plays the entry that takes its place. */
export function remove(indices: readonly number[]) {
  return native.remove(indices);
}

export function move(from: number, to: number) {
  return native.move(from, to);
}

export function play() {
  return native.play();
}

export function pause() {
  return native.pause();
}

export function toggle() {
  return native.toggle();
}

/** Resolves false while the interstitial plays or nothing is loaded. */
export function seekTo(positionMs: number) {
  return native.seekTo(positionMs);
}

/** Resolves false at the end of the queue (repeat off) or during the interstitial. */
export function next() {
  return native.next();
}

/**
 * Restarts the track after 3 seconds of it (or on the first entry), else goes
 * back. Resolves false during the interstitial.
 */
export function previous() {
  return native.previous();
}

/** Resolves false for an invalid index or during the interstitial. */
export function skipTo(index: number) {
  return native.skipTo(index);
}

export function setRepeatMode(mode: RepeatMode) {
  return native.setRepeatMode(mode);
}

/** Free tier: the bundled ad and its threshold. Premium: `null`. */
export function configureInterstitial(config: InterstitialConfig | null) {
  return native.configureInterstitial(config);
}

export function getState() {
  return native.getState();
}

export function getQueue() {
  return native.getQueue();
}

/**
 * Subscribes to a native event. `progress` is only produced while it has a
 * listener.
 */
export function addListener<E extends AudioEventName>(
  event: E,
  listener: AudioEvents[E],
) {
  return native.addListener(event, listener);
}

const idleState = {
  status: "idle",
  index: null,
  trackId: null,
  positionMs: 0,
  durationMs: 0,
  repeatMode: "off",
  queueLength: 0,
  interstitial: false,
  listenedMs: 0,
} satisfies PlaybackState;

const stateStore = createSnapshotStore<PlaybackState>(
  {
    listen(set) {
      const subscription = addListener("state", set);
      return () => subscription.remove();
    },
    read: getState,
  },
  idleState,
);

const progressStore = createSnapshotStore<Progress>(
  {
    listen(set) {
      const progress = addListener("progress", set);
      const state = addListener("state", ({ positionMs, durationMs }) =>
        set({ positionMs, durationMs }),
      );
      return () => {
        progress.remove();
        state.remove();
      };
    },
    read: () =>
      getState().then(({ positionMs, durationMs }) => ({
        positionMs,
        durationMs,
      })),
  },
  { positionMs: 0, durationMs: 0 },
);

/** The latest playback state; re-renders on state events only. */
export function usePlaybackState() {
  return useSyncExternalStore(stateStore.subscribe, stateStore.getSnapshot);
}

/** Position and duration, about twice a second while playing. */
export function useProgress() {
  return useSyncExternalStore(
    progressStore.subscribe,
    progressStore.getSnapshot,
  );
}
