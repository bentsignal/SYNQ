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
export type LegacyPremiumCache = { kind: "lifetime" } | { kind: "until"; expiresAt: number };

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
): LegacySettings {
  return {
    preferences: {
      accent: parseAccent(values.theme),
      // 2.5.2: `haptic === 'false' ? false : true`.
      haptics: values.haptic !== "false",
      shuffle: values.shuffle === "true",
      repeat: values.loop === "true" ? "all" : "off",
    },
    session: parseSession(values, library),
    premiumCache: parsePremiumCache(values.expiration),
    ads: {
      listenedMs: Math.max(0, Math.round((parseNumber(values.timePlayed) ?? 0) * 1000)),
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

function parseAccent(value: string | undefined): string | null {
  return value && /^#[0-9a-f]{6}$/i.test(value.trim()) ? value.trim().toLowerCase() : null;
}

function parsePremiumCache(value: string | undefined): LegacyPremiumCache | null {
  if (!value || value === "null") return null;
  if (value === "never") return { kind: "lifetime" };
  const expiresAt = Date.parse(value);
  return Number.isFinite(expiresAt) ? { kind: "until", expiresAt } : null;
}

function parseSession(values: Readonly<Record<string, string>>, library: LegacyLibraryIds): LegacyPlaybackSession | null {
  if (!values.queue) return null;
  let tracks: unknown;
  try {
    tracks = JSON.parse(values.queue);
  } catch {
    return null;
  }
  if (!Array.isArray(tracks) || tracks.length === 0) return null;

  const kept: { songId: number; from: number }[] = [];
  tracks.forEach((track: unknown, from) => {
    const id = typeof track === "object" && track !== null ? toInteger((track as { id?: unknown }).id) : null;
    if (id !== null && id !== AD_TRACK_ID && id > 0 && library.songIds.has(id)) kept.push({ songId: id, from });
  });
  if (kept.length === 0) return null;

  const stored = Math.min(Math.max(parseInteger(values.lastTrackIndex) ?? 0, 0), tracks.length - 1);
  // The stored current track, or the next one kept after it (an ad skipped forward), else the last kept.
  let currentIndex = kept.findIndex((entry) => entry.from >= stored);
  if (currentIndex === -1) currentIndex = kept.length - 1;
  const sameTrack = kept[currentIndex]?.from === stored;

  return {
    queueSongIds: kept.map((entry) => entry.songId),
    currentIndex,
    positionMs: sameTrack ? Math.max(0, Math.round((parseNumber(values.position) ?? 0) * 1000)) : 0,
    source: parseSource(values.sourceType, values.sourceId, library),
    insertOffset: Math.max(0, parseInteger(values.addOffset) ?? 0),
  };
}

function parseSource(type: string | undefined, id: string | undefined, library: LegacyLibraryIds): LegacyPlaybackSource | null {
  const sourceType = parseInteger(type);
  const sourceId = parseInteger(id);
  if (sourceType === null || sourceId === null) return null;
  switch (sourceType) {
    case 1:
      if (sourceId === 1) return { kind: "library" };
      return library.playlistIds.has(sourceId) ? { kind: "playlist", id: sourceId } : null;
    case 2:
      return library.albumIds.has(sourceId) ? { kind: "album", id: sourceId } : null;
    case 3:
      return library.artistIds.has(sourceId) ? { kind: "artist", id: sourceId } : null;
    case 4:
      return library.songIds.has(sourceId) ? { kind: "song", id: sourceId } : null;
    default:
      return null;
  }
}

function parseNumber(value: string | undefined): number | null {
  if (value === undefined || value.trim() === "") return null;
  const number = Number(value);
  return Number.isFinite(number) ? number : null;
}

function parseInteger(value: string | undefined): number | null {
  const number = parseNumber(value);
  return number === null ? null : Math.trunc(number);
}

function toInteger(value: unknown): number | null {
  if (typeof value === "number") return Number.isInteger(value) ? value : null;
  if (typeof value === "string" && /^-?\d+$/.test(value.trim())) return Number(value);
  return null;
}
