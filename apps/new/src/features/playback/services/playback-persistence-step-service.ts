import type { PlaybackQueueItem } from "../types/playback-state";

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
