/**
 * The playback session as stored in the kv store, and how a stored (or
 * 2.5.2) session turns back into a queue. Pure, so node tests cover it.
 */
import type { RepeatMode } from "@synq/audio";
import type {
  LegacyPlaybackSession,
  LegacyPlaybackSource,
  LegacySettings,
} from "@synq/db/legacy";

import type { Queue, QueueEntry } from "./queue-model";
import type { PlaybackSource } from "./types";
import { currentIndex, EMPTY_QUEUE, nextKey } from "./queue-model.ts";

export interface StoredSession {
  readonly songIds: readonly number[];
  /** Indices of entries added with Play Next. */
  readonly queued: readonly number[];
  /** The current entry, or -1 for an empty queue. */
  readonly index: number;
  readonly positionMs: number;
  /** While shuffled: the unshuffled order, as indices into `songIds`. */
  readonly original: readonly number[] | null;
  readonly source: PlaybackSource | null;
  readonly shuffle: boolean;
  readonly repeat: RepeatMode;
  /** Listening time counted toward the free tier's ad. */
  readonly listenedMs: number;
}

export const EMPTY_SESSION = storedSession({
  index: -1,
  listenedMs: 0,
  original: null,
  positionMs: 0,
  queued: [],
  repeat: "off",
  shuffle: false,
  songIds: [],
  source: null,
});

/** Types a session built from parts. */
function storedSession(session: StoredSession) {
  return session;
}

export function encodeSession(
  queue: Queue,
  rest: Omit<StoredSession, "songIds" | "queued" | "index" | "original">,
) {
  const indexByKey = new Map(
    queue.entries.map((entry, index) => [entry.key, index]),
  );
  return storedSession({
    ...rest,
    index: currentIndex(queue),
    original:
      queue.original?.flatMap((key) => {
        const index = indexByKey.get(key);
        return index === undefined ? [] : [index];
      }) ?? null,
    queued: queue.entries.flatMap((entry, index) =>
      entry.queued ? [index] : [],
    ),
    songIds: queue.entries.map((entry) => entry.songId),
  });
}

/** The queue a stored session describes, keeping only songs that still exist. */
export function queueFromSession(
  session: StoredSession,
  exists: (songId: number) => boolean,
) {
  const queued = new Set(session.queued);
  const all = session.songIds.map(
    (songId, index): QueueEntry & { index: number } => ({
      index,
      key: nextKey(songId),
      queued: queued.has(index),
      songId,
    }),
  );
  const entries = all.filter((entry) => exists(entry.songId));
  if (entries.length === 0) return queueOf(EMPTY_QUEUE);
  // The stored current song, else the next one that still exists.
  const current =
    entries.find((entry) => entry.index >= session.index) ?? entries.at(-1);
  const byIndex = new Map(entries.map((entry) => [entry.index, entry.key]));
  return queueOf({
    currentKey: current?.key ?? null,
    entries: entries.map(({ key, queued: isQueued, songId }) => ({
      key,
      queued: isQueued,
      songId,
    })),
    original:
      session.original?.flatMap((index) => byIndex.get(index) ?? []) ?? null,
  });
}

function queueOf(queue: Queue) {
  return queue;
}

/** Where the restored queue starts: the stored position, if it's the same song. */
export function restoredPosition(session: StoredSession, queue: Queue) {
  const current = queue.entries[currentIndex(queue)];
  return current !== undefined &&
    session.songIds[session.index] === current.songId
    ? session.positionMs
    : 0;
}

/** A stored session checked field by field; null when there is none. */
export function decodeSession(stored: unknown) {
  if (typeof stored !== "object" || stored === null) return null;
  function field(key: string) {
    return asUnknown(Reflect.get(stored ?? {}, key));
  }
  const songIds = numbers(field("songIds"));
  const index = integer(field("index"), -1);
  return storedSession({
    index: songIds.length === 0 ? -1 : clamp(index, 0, songIds.length - 1),
    listenedMs: nonNegative(field("listenedMs")),
    original: Array.isArray(field("original"))
      ? numbers(field("original")).filter((i) => i < songIds.length)
      : null,
    positionMs: nonNegative(field("positionMs")),
    queued: numbers(field("queued")),
    repeat: repeatMode(field("repeat")),
    shuffle: field("shuffle") === true,
    songIds,
    source: playbackSource(field("source")),
  });
}

/**
 * The first session after updating from 2.5.2: its queue (an ad entry is
 * already dropped by the importer), position, source, Play Next count,
 * shuffle and repeat, and the ad counter. 2.5.2's queue was already in
 * shuffled order when shuffle was on, and it never kept the unshuffled
 * one, so turning shuffle off keeps the order.
 */
export function sessionFromLegacy({
  session,
  preferences,
  ads,
  likedPlaylistId,
  adThresholdMs,
}: {
  session: LegacyPlaybackSession | null;
  preferences: Pick<LegacySettings["preferences"], "shuffle" | "repeat"> | null;
  ads: LegacySettings["ads"] | null;
  likedPlaylistId: number | null;
  adThresholdMs: number;
}) {
  const listenedMs =
    ads === null
      ? 0
      : ads.due
        ? Math.max(ads.listenedMs, adThresholdMs)
        : ads.listenedMs;
  const base = storedSession({
    ...EMPTY_SESSION,
    listenedMs,
    repeat: preferences?.repeat ?? "off",
    shuffle: preferences?.shuffle ?? false,
  });
  if (session === null || session.queueSongIds.length === 0) return base;
  const index = clamp(session.currentIndex, 0, session.queueSongIds.length - 1);
  const queued = Array.from(
    { length: Math.max(0, session.insertOffset) },
    (_, i) => index + 1 + i,
  ).filter((i) => i < session.queueSongIds.length);
  return storedSession({
    ...base,
    index,
    positionMs: session.positionMs,
    queued,
    songIds: session.queueSongIds,
    source: sourceFromLegacy(session.source, likedPlaylistId),
  });
}

function sourceFromLegacy(
  source: LegacyPlaybackSource | null,
  likedPlaylistId: number | null,
) {
  if (source === null) return null;
  switch (source.kind) {
    case "library":
      return playbackSourceOf({ kind: "library" });
    case "playlist":
      return playbackSourceOf(
        source.id === likedPlaylistId
          ? { kind: "liked" }
          : { id: source.id, kind: "playlist" },
      );
    case "album":
    case "artist":
      return playbackSourceOf({ id: source.id, kind: source.kind });
    case "song":
      // A single song 2.5.2 played from search: nothing to show it's from.
      return null;
  }
}

function playbackSourceOf(source: PlaybackSource) {
  return source;
}

const WHOLE_SOURCES = new Set(["library", "liked", "search"] as const);
const ENTITY_SOURCES = new Set(["playlist", "album", "artist"] as const);

function playbackSource(value: unknown) {
  if (typeof value !== "object" || value === null) return null;
  const kind = String(Reflect.get(value, "kind"));
  const id = integer(Reflect.get(value, "id"), null);
  const whole = [...WHOLE_SOURCES].find((candidate) => candidate === kind);
  if (whole !== undefined) return playbackSourceOf({ kind: whole });
  const entity = [...ENTITY_SOURCES].find((candidate) => candidate === kind);
  if (entity === undefined) return null;
  return id === null ? null : playbackSourceOf({ id, kind: entity });
}

function repeatMode(value: unknown) {
  return value === "all" || value === "one" ? value : ("off" as const);
}

function numbers(value: unknown) {
  if (!Array.isArray(value)) return [];
  return value.filter(
    (item): item is number =>
      typeof item === "number" && Number.isInteger(item) && item >= 0,
  );
}

function asUnknown(value: unknown) {
  return value;
}

function integer<Fallback>(value: unknown, fallback: Fallback) {
  return typeof value === "number" && Number.isInteger(value)
    ? value
    : fallback;
}

function nonNegative(value: unknown) {
  return typeof value === "number" && Number.isFinite(value) && value > 0
    ? value
    : 0;
}

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}
