import {
  initialPlaybackAdGateState,
  resetPlaybackAdGate,
} from "./playback-ad-gate-service";
import { initialPlaybackState } from "./playback-session-service";
import type {
  PlaybackAdGateState,
  PlaybackMode,
  PlaybackQueueFilter,
  PlaybackQueueItem,
  PlaybackSource,
} from "../types/playback-state";

export const isRecord = (value: unknown): value is Record<string, unknown> =>
  !!value && typeof value === "object" && !Array.isArray(value);

export const numberOrNull = (value: unknown) =>
  typeof value === "number" && Number.isFinite(value) ? value : null;

export const finiteNumber = (value: unknown, fallback: number) =>
  typeof value === "number" && Number.isFinite(value) ? value : fallback;

export const normalizeQueueItem = (
  value: unknown,
): PlaybackQueueItem | null => {
  if (!isRecord(value)) {
    return null;
  }

  const id = finiteNumber(value.id, Number.NaN);
  if (!Number.isFinite(id)) {
    return null;
  }

  return {
    album: typeof value.album === "string" ? value.album : "Unknown",
    artist: typeof value.artist === "string" ? value.artist : "Unknown",
    duration: numberOrNull(value.duration),
    id,
    pathToFile: typeof value.pathToFile === "string" ? value.pathToFile : null,
    title: typeof value.title === "string" ? value.title : "Untitled song",
  };
};

export const normalizeMode = (value: unknown): PlaybackMode => {
  if (!isRecord(value)) {
    return initialPlaybackState.mode;
  }

  return {
    loop: typeof value.loop === "boolean" ? value.loop : false,
    shuffle: typeof value.shuffle === "boolean" ? value.shuffle : false,
  };
};

export const normalizeAdGate = (value: unknown): PlaybackAdGateState => {
  if (!isRecord(value)) {
    return initialPlaybackAdGateState;
  }

  const thresholdMs = finiteNumber(
    value.thresholdMs,
    initialPlaybackAdGateState.thresholdMs,
  );
  const accumulatedMs = Math.min(
    thresholdMs,
    Math.max(0, finiteNumber(value.accumulatedMs, 0)),
  );
  const playbackDuration = Math.max(
    0,
    finiteNumber(value.playbackDuration, 0),
  );
  const playbackPosition = Math.min(
    playbackDuration,
    Math.max(0, finiteNumber(value.playbackPosition, 0)),
  );
  const active = typeof value.active === "boolean" ? value.active : false;
  const due =
    typeof value.due === "boolean" ? value.due : accumulatedMs >= thresholdMs;
  const lastTrackedPosition = numberOrNull(value.lastTrackedPosition);

  return {
    accumulatedMs,
    active,
    playbackDuration,
    playbackPosition,
    due,
    lastTrackedPosition:
      lastTrackedPosition !== null && lastTrackedPosition >= 0
        ? lastTrackedPosition
        : null,
    thresholdMs,
  };
};

export const normalizeRestoredAdGate = (value: unknown) => {
  const adGate = normalizeAdGate(value);

  return adGate.active ? resetPlaybackAdGate(adGate) : adGate;
};

export const normalizeQueueFilter = (value: unknown): PlaybackQueueFilter => {
  if (!isRecord(value)) {
    return initialPlaybackState.queueFilter;
  }

  return {
    order: value.order === "asc" || value.order === "desc" ? value.order : "desc",
    query: typeof value.query === "string" ? value.query : "",
    sort:
      value.sort === "album" ||
      value.sort === "artist" ||
      value.sort === "recent" ||
      value.sort === "title"
        ? value.sort
        : "recent",
  };
};

export const normalizeSource = (value: unknown): PlaybackSource | null => {
  if (!isRecord(value)) {
    return null;
  }

  if (value.type === "library") {
    return { type: "library" };
  }

  if (
    (value.type === "album" ||
      value.type === "artist" ||
      value.type === "playlist") &&
    typeof value.id === "number" &&
    Number.isFinite(value.id)
  ) {
    return { id: value.id, type: value.type };
  }

  return null;
};
