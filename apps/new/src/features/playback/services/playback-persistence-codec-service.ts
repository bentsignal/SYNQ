import { initialPlaybackState } from "./playback-initial-state-service";
import {
  finiteNumber,
  isRecord,
  normalizeMode,
  normalizeQueueFilter,
  normalizeQueueItem,
  normalizeRestoredAdGate,
  normalizeSource,
  numberOrNull,
} from "./playback-persistence-normalizer-service";
import type {
  PlaybackState,
} from "../types/playback-state";

export type PersistedPlaybackState = Pick<
  PlaybackState,
  | "activeQueueIndex"
  | "activeTrackId"
  | "addOffset"
  | "adGate"
  | "duration"
  | "isPlaying"
  | "mode"
  | "position"
  | "queue"
  | "queueFilter"
  | "source"
>;

export const toPersistedPlaybackState = (
  state: PlaybackState,
): PersistedPlaybackState => ({
  activeQueueIndex: state.activeQueueIndex,
  activeTrackId: state.activeTrackId,
  addOffset: state.addOffset,
  adGate: state.adGate,
  duration: state.duration,
  isPlaying: state.isPlaying,
  mode: state.mode,
  position: state.position,
  queue: state.queue,
  queueFilter: state.queueFilter,
  source: state.source,
});

export const normalizePlaybackState = (value: unknown): PlaybackState => {
  if (!isRecord(value)) {
    return initialPlaybackState;
  }

  const queue = Array.isArray(value.queue)
    ? value.queue.flatMap((item) => {
        const queueItem = normalizeQueueItem(item);
        return queueItem ? [queueItem] : [];
      })
    : [];
  const activeQueueIndex = numberOrNull(value.activeQueueIndex);
  const activeTrackId = numberOrNull(value.activeTrackId);

  return {
    ...initialPlaybackState,
    activeQueueIndex:
      activeQueueIndex !== null &&
      activeQueueIndex >= 0 &&
      activeQueueIndex < queue.length
        ? activeQueueIndex
        : null,
    activeTrackId,
    addOffset: finiteNumber(value.addOffset, initialPlaybackState.addOffset),
    adGate: normalizeRestoredAdGate(value.adGate),
    duration: finiteNumber(value.duration, initialPlaybackState.duration),
    error: null,
    isPlaying: typeof value.isPlaying === "boolean" ? value.isPlaying : false,
    mode: normalizeMode(value.mode),
    position: finiteNumber(value.position, initialPlaybackState.position),
    queue,
    queueFilter: normalizeQueueFilter(value.queueFilter),
    source: normalizeSource(value.source),
  };
};
