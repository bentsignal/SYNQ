import { initialPlaybackState } from "./playback-initial-state-service";
import type {
  PlaybackMode,
  PlaybackQueueFilter,
  PlaybackSource,
} from "../types/playback-state";
import { isRecord } from "./playback-persistence-step-service";

export const normalizeMode = (value: unknown): PlaybackMode => {
  if (!isRecord(value)) {
    return initialPlaybackState.mode;
  }

  return {
    loop: typeof value.loop === "boolean" ? value.loop : false,
    shuffle: typeof value.shuffle === "boolean" ? value.shuffle : false,
  };
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
