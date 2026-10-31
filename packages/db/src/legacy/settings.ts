/**
 * Turns 2.5.2's AsyncStorage strings into typed 3.0 preferences and the
 * playback session, for the app to write into its kv-store. Every field
 * falls back to 2.5.2's own default when its key is missing or malformed.
 */

/** 2.5.2's `loop` refilled the queue from its source at the end: repeat all. */
export type LegacyRepeatMode = "off" | "all";

/** What the queue was built from (2.5.2's `sourceType` + `sourceId`). */
export type LegacyPlaybackSource =
  /** 2.5.2's hidden "Library" playlist (id 1): the whole library. */
  | { kind: "library" }
  | { kind: "playlist"; id: number }
  | { kind: "album"; id: number }
  | { kind: "artist"; id: number }
  | { kind: "song"; id: number };

export interface LegacyPlaybackSession {
  /** Song ids in queue order; ad tracks and songs not in the library are removed. */
  queueSongIds: number[];
  /** Index into `queueSongIds` of the current track. */
  currentIndex: number;
  /** Position in the current track; 0 if the stored current track was dropped. */
  positionMs: number;
  source: LegacyPlaybackSource | null;
  /** 2.5.2's `addOffset`: how many "add to queue" songs follow the current track. */
  insertOffset: number;
}

/** 2.5.2's cached premium status (`expiration`), a hint until RevenueCat answers. */
export type LegacyPremiumCache =
  | { kind: "lifetime" }
  | { kind: "until"; expiresAt: number };

export interface LegacySettings {
  preferences: {
    /** The theme accent hex (lowercase), or null for the default blue. */
    accent: string | null;
    haptics: boolean;
    shuffle: boolean;
    repeat: LegacyRepeatMode;
  };
  session: LegacyPlaybackSession | null;
  premiumCache: LegacyPremiumCache | null;
  ads: {
    /** Listening time counted toward the next ad (2.5.2's `timePlayed`, seconds). */
    listenedMs: number;
    /** 2.5.2's `playAd`: the threshold was reached and the ad plays at the next transition. */
    due: boolean;
  };
  bookkeeping: {
    importCount: number;
    reviewRequested: boolean;
    /** The last export batch number (2.5.2 names export folders "batch N"). */
    exportNumber: number | null;
    /** 2.5.2's `dbVersion` (2 once `albumSongs.track` was added). */
    legacyDbVersion: number | null;
  };
  /** Keys present but not understood (values omitted). */
  unknownKeys: string[];
}

export interface LegacyLibraryIds {
  songIds: ReadonlySet<number>;
  playlistIds: ReadonlySet<number>;
  albumIds: ReadonlySet<number>;
  artistIds: ReadonlySet<number>;
}

const KNOWN_KEYS = new Set([
  "theme",
  "haptic",
  "shuffle",
  "loop",
  "queue",
  "lastTrackIndex",
  "position",
  "sourceType",
  "sourceId",
  "expiration",
  "playAd",
  "timePlayed",
  "addOffset",
  "importCount",
  "reviewAlreadyRequested",
  "exportNumber",
  "dbVersion",
  // Written by 2.5.2's (hidden) analytics toggle; analytics consent isn't carried over.
  "allowAnalytics",
]);

/** The 2.5.2 queue's interstitial ad track id. */
const AD_TRACK_ID = -2;

export function parseLegacySettings(
  values: Readonly<Record<string, string>>,
  library: LegacyLibraryIds,
) {
  return {
    preferences: {
      accent: parseAccent(values.theme),
      // 2.5.2: `haptic === 'false' ? false : true`.
      haptics: values.haptic !== "false",
      shuffle: values.shuffle === "true",
      repeat: values.loop === "true" ? ("all" as const) : ("off" as const),
    },
    session: parseSession(values, library),
    premiumCache: parsePremiumCache(values.expiration),
    ads: {
      listenedMs: Math.max(
        0,
        Math.round((parseNumber(values.timePlayed) ?? 0) * 1000),
      ),
      due: values.playAd === "true",
    },
    bookkeeping: {
      importCount: Math.max(0, parseInteger(values.importCount) ?? 0),
      reviewRequested: values.reviewAlreadyRequested === "true",
      exportNumber: parseInteger(values.exportNumber),
      legacyDbVersion: parseInteger(values.dbVersion),
    },
    unknownKeys: Object.keys(values)
      .filter((key) => !KNOWN_KEYS.has(key))
      .sort(),
  };
}

function parseAccent(value: string | undefined) {
  return value && /^#[0-9a-f]{6}$/i.test(value.trim())
    ? value.trim().toLowerCase()
    : null;
}

function parsePremiumCache(value: string | undefined) {
  if (!value || value === "null") return null;
  if (value === "never") return { kind: "lifetime" as const };
  const expiresAt = Date.parse(value);
  return Number.isFinite(expiresAt)
    ? { kind: "until" as const, expiresAt }
    : null;
}

/** The stored queue as a list, or null if it is missing, malformed, or empty. */
function parseQueue(queue: string | undefined) {
  if (!queue) return null;
  let tracks: unknown;
  try {
    tracks = JSON.parse(queue);
  } catch {
    return null;
  }
  return isNonEmptyList(tracks) ? tracks : null;
}

function isNonEmptyList(value: unknown): value is unknown[] {
  return Array.isArray(value) && value.length > 0;
}

function parseSession(
  values: Readonly<Record<string, string>>,
  library: LegacyLibraryIds,
) {
  const tracks = parseQueue(values.queue);
  if (!tracks) return null;

  const kept = keptTracks(tracks, library);
  if (kept.length === 0) return null;

  const stored = Math.min(
    Math.max(parseInteger(values.lastTrackIndex) ?? 0, 0),
    tracks.length - 1,
  );
  // The stored current track, or the next one kept after it (an ad skipped forward), else the last kept.
  let currentIndex = kept.findIndex((entry) => entry.from >= stored);
  if (currentIndex === -1) currentIndex = kept.length - 1;
  const sameTrack = kept[currentIndex]?.from === stored;

  return {
    queueSongIds: kept.map((entry) => entry.songId),
    currentIndex,
    positionMs: sameTrack
      ? Math.max(0, Math.round((parseNumber(values.position) ?? 0) * 1000))
      : 0,
    source: parseSource(values.sourceType, values.sourceId, library),
    insertOffset: Math.max(0, parseInteger(values.addOffset) ?? 0),
  };
}

/** Queue entries that are library songs (not ad tracks), with their index in the stored queue. */
function keptTracks(tracks: readonly unknown[], library: LegacyLibraryIds) {
  const kept = new Array<{ songId: number; from: number }>();
  tracks.forEach((track, from) => {
    const id =
      typeof track === "object" && track !== null && "id" in track
        ? toInteger(track.id)
        : null;
    if (id !== null && id !== AD_TRACK_ID && id > 0 && library.songIds.has(id))
      kept.push({ songId: id, from });
  });
  return kept;
}

function parseSource(
  type: string | undefined,
  id: string | undefined,
  library: LegacyLibraryIds,
) {
  const sourceType = parseInteger(type);
  const sourceId = parseInteger(id);
  if (sourceType === null || sourceId === null) return null;
  if (sourceType === 1 && sourceId === 1) return { kind: "library" as const };
  // 2.5.2's `sourceType` numbering; a source whose entity is gone is dropped.
  const source = [
    [1, "playlist", library.playlistIds],
    [2, "album", library.albumIds],
    [3, "artist", library.artistIds],
    [4, "song", library.songIds],
  ] as const;
  const match = source.find(([number]) => number === sourceType);
  return match?.[2].has(sourceId) ? { kind: match[1], id: sourceId } : null;
}

function parseNumber(value: string | undefined) {
  if (value === undefined || value.trim() === "") return null;
  const number = Number(value);
  return Number.isFinite(number) ? number : null;
}

function parseInteger(value: string | undefined) {
  const number = parseNumber(value);
  return number === null ? null : Math.trunc(number);
}

function toInteger(value: unknown) {
  if (typeof value === "number") return Number.isInteger(value) ? value : null;
  if (typeof value === "string" && /^-?\d+$/.test(value.trim()))
    return Number(value);
  return null;
}
