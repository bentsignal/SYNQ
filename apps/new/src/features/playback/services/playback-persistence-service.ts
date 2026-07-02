import * as FileSystem from "expo-file-system";
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
  PlaybackState,
} from "../types/playback-state";

const playbackStateDirectory = `${FileSystem.documentDirectory}playback`;
const playbackStateFile = `${playbackStateDirectory}/session.json`;

type PersistedPlaybackState = Pick<
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

const isRecord = (value: unknown): value is Record<string, unknown> =>
  !!value && typeof value === "object" && !Array.isArray(value);

const numberOrNull = (value: unknown) =>
  typeof value === "number" && Number.isFinite(value) ? value : null;

const finiteNumber = (value: unknown, fallback: number) =>
  typeof value === "number" && Number.isFinite(value) ? value : fallback;

const normalizeQueueItem = (value: unknown): PlaybackQueueItem | null => {
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

const normalizeMode = (value: unknown): PlaybackMode => {
  if (!isRecord(value)) {
    return initialPlaybackState.mode;
  }

  return {
    loop: typeof value.loop === "boolean" ? value.loop : false,
    shuffle: typeof value.shuffle === "boolean" ? value.shuffle : false,
  };
};

const normalizeAdGate = (value: unknown): PlaybackAdGateState => {
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
    typeof value.due === "boolean"
      ? value.due
      : accumulatedMs >= thresholdMs;
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

const normalizeQueueFilter = (value: unknown): PlaybackQueueFilter => {
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

const normalizeSource = (value: unknown): PlaybackSource | null => {
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

const toPersistedPlaybackState = (
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

const normalizePlaybackState = (value: unknown): PlaybackState => {
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
  const adGate = normalizeAdGate(value.adGate);

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
    adGate: adGate.active ? resetPlaybackAdGate(adGate) : adGate,
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

const ensurePlaybackStateDirectory = async () => {
  if (!FileSystem.documentDirectory) {
    throw new Error("The document directory is not available.");
  }

  await FileSystem.makeDirectoryAsync(playbackStateDirectory, {
    intermediates: true,
  });
};

export async function loadPersistedPlaybackState(): Promise<PlaybackState> {
  try {
    const fileInfo = await FileSystem.getInfoAsync(playbackStateFile);
    if (!fileInfo.exists) {
      return initialPlaybackState;
    }

    const contents = await FileSystem.readAsStringAsync(playbackStateFile);

    return normalizePlaybackState(JSON.parse(contents));
  } catch {
    return initialPlaybackState;
  }
}

export async function savePersistedPlaybackState(state: PlaybackState) {
  await ensurePlaybackStateDirectory();
  await FileSystem.writeAsStringAsync(
    playbackStateFile,
    JSON.stringify(toPersistedPlaybackState(state)),
  );
}

export async function clearPersistedPlaybackState() {
  await FileSystem.deleteAsync(playbackStateFile, { idempotent: true });
}
