/**
 * Reads the 2.5.2 database defensively. 2.5.2 created its tables with
 * `CREATE TABLE IF NOT EXISTS` and no constraints, added `albumSongs.track`
 * in a migration that could fail silently, and a few 3.0 TestFlight / dev
 * builds altered the same file, so every table and column is detected with
 * `PRAGMA table_info` and anything missing reads as null.
 *
 * SQLite column affinity is loose (an INTEGER column can hold `'2019-05-01'`
 * or `215.5`), so values are coerced here, once.
 */
import type { LegacyDatabase, LegacyImportWarning, LegacyRow } from "./types.ts";

export interface LegacySongRow {
  id: number;
  title: string | null;
  edited: boolean;
  /** Seconds, as 2.5.2 stored them (floored by its `loadAudio`). */
  durationSeconds: number | null;
  fileType: string | null;
  fileName: string | null;
}

export interface LegacyNamedRow {
  id: number;
  name: string | null;
}

export interface LegacyAlbumRow extends LegacyNamedRow {
  year: number | null;
}

/** A join row; its rowid (= its `id`) is 2.5.2's only notion of order, and becomes `playlist_songs.id`. */
export interface LegacyLinkRow {
  rowid: number;
  left: number;
  right: number;
  track: number | null;
}

export interface LegacySnapshot {
  songs: LegacySongRow[];
  artists: LegacyNamedRow[];
  albums: LegacyAlbumRow[];
  playlists: LegacyNamedRow[];
  /** artistId → songId */
  artistSongs: LegacyLinkRow[];
  /** albumId → songId, with track */
  albumSongs: LegacyLinkRow[];
  /** artistId → albumId */
  artistsAlbums: LegacyLinkRow[];
  /** playlistId → songId */
  playlistSongs: LegacyLinkRow[];
  /** `sqlite_sequence`, so 3.0 never reuses an id 2.5.2 handed out. */
  sequences: Record<string, number>;
}

interface TableSpec {
  name: string;
  columns: readonly string[];
  /** Columns whose absence is expected in some valid 2.5.2 databases. */
  optional?: readonly string[];
}

const TABLES = {
  songs: { name: "songs", columns: ["id", "title", "edited", "duration", "fileType", "fileName"] },
  artists: { name: "artists", columns: ["id", "name"] },
  albums: { name: "albums", columns: ["id", "name", "year"] },
  playlists: { name: "playlists", columns: ["id", "name"] },
  artistSongs: { name: "artistSongs", columns: ["id", "artistId", "songId"] },
  albumSongs: { name: "albumSongs", columns: ["id", "albumId", "songId", "track"], optional: ["track"] },
  artistsAlbums: { name: "artistsAlbums", columns: ["id", "artistId", "albumId"] },
  playlistSongs: { name: "playlistSongs", columns: ["id", "playlistId", "songId"] },
} as const satisfies Record<string, TableSpec>;

export async function readLegacyDatabase(
  legacy: LegacyDatabase,
  warnings: LegacyImportWarning[],
): Promise<LegacySnapshot> {
  const tables = new Set(
    (await legacy.all("SELECT name FROM sqlite_master WHERE type = 'table'")).map((row) => String(row.name)),
  );

  async function read(spec: TableSpec): Promise<LegacyRow[] | null> {
    if (!tables.has(spec.name)) {
      warnings.push({ code: "missing-table", message: `Table ${spec.name} is missing` });
      return null;
    }
    const present = new Set(
      (await legacy.all(`PRAGMA table_info(${quote(spec.name)})`)).map((row) => String(row.name)),
    );
    const columns = spec.columns.filter((column) => present.has(column));
    const missing = spec.columns.filter((column) => !present.has(column));
    if (missing.length > 0) {
      warnings.push({
        code: "missing-column",
        message: `${spec.name} is missing ${missing.join(", ")}${
          missing.every((c) => spec.optional?.includes(c)) ? " (an older 2.5.x database)" : ""
        }`,
      });
    }
    const select = ["rowid AS __rowid", ...columns.map(quote)].join(", ");
    return legacy.all(`SELECT ${select} FROM ${quote(spec.name)} ORDER BY rowid`);
  }

  const invalid: string[] = [];
  const withId = <T>(table: string, rows: LegacyRow[] | null, map: (row: LegacyRow, id: number) => T): T[] =>
    (rows ?? []).flatMap((row) => {
      // A table without an `id` column still has a rowid; 2.5.2's `id` is that rowid.
      const id = toId(row.id ?? row.__rowid);
      if (id === null) {
        invalid.push(table);
        return [];
      }
      return [map(row, id)];
    });

  const songs = withId("songs", await read(TABLES.songs), (row, id) => ({
    id,
    title: toText(row.title),
    edited: toBoolean(row.edited),
    durationSeconds: toNumber(row.duration),
    fileType: toText(row.fileType),
    fileName: toText(row.fileName),
  }));
  const named = (row: LegacyRow, id: number) => ({ id, name: toText(row.name) });
  const artists = withId("artists", await read(TABLES.artists), named);
  const albums = withId("albums", await read(TABLES.albums), (row, id) => ({ ...named(row, id), year: toYear(row.year) }));
  const playlists = withId("playlists", await read(TABLES.playlists), named);

  const links = (table: string, rows: LegacyRow[] | null, left: string, right: string): LegacyLinkRow[] =>
    (rows ?? []).flatMap((row) => {
      const l = toId(row[left]);
      const r = toId(row[right]);
      const rowid = toId(row.__rowid);
      if (l === null || r === null || rowid === null) {
        invalid.push(table);
        return [];
      }
      return [{ rowid, left: l, right: r, track: toTrack(row.track) }];
    });

  const snapshot: LegacySnapshot = {
    songs,
    artists,
    albums,
    playlists,
    artistSongs: links("artistSongs", await read(TABLES.artistSongs), "artistId", "songId"),
    albumSongs: links("albumSongs", await read(TABLES.albumSongs), "albumId", "songId"),
    artistsAlbums: links("artistsAlbums", await read(TABLES.artistsAlbums), "artistId", "albumId"),
    playlistSongs: links("playlistSongs", await read(TABLES.playlistSongs), "playlistId", "songId"),
    sequences: {},
  };

  if (tables.has("sqlite_sequence")) {
    for (const row of await legacy.all("SELECT name, seq FROM sqlite_sequence")) {
      const seq = toId(row.seq);
      if (seq !== null) snapshot.sequences[String(row.name)] = seq;
    }
  }

  if (invalid.length > 0) {
    const counts = new Map<string, number>();
    for (const table of invalid) counts.set(table, (counts.get(table) ?? 0) + 1);
    warnings.push({
      code: "invalid-row",
      message: `Skipped rows without usable ids: ${[...counts].map(([t, n]) => `${t} ${n}`).join(", ")}`,
    });
  }
  return snapshot;
}

function quote(identifier: string): string {
  return `"${identifier.replace(/"/g, '""')}"`;
}

/** A positive integer id (ids, foreign keys). Accepts `3`, `3.0`, `'3'`. */
export function toId(value: unknown): number | null {
  const number = typeof value === "string" && value.trim() !== "" ? Number(value) : value;
  if (typeof number === "bigint") return number > 0n && number <= BigInt(Number.MAX_SAFE_INTEGER) ? Number(number) : null;
  return typeof number === "number" && Number.isSafeInteger(number) && number > 0 ? number : null;
}

function toText(value: unknown): string | null {
  if (value === null || value === undefined) return null;
  if (typeof value === "string") return value;
  if (typeof value === "number" || typeof value === "bigint") return String(value);
  if (value instanceof Uint8Array) return new TextDecoder().decode(value);
  return null;
}

function toNumber(value: unknown): number | null {
  const number = typeof value === "string" && value.trim() !== "" ? Number(value) : value;
  if (typeof number === "bigint") return Number(number);
  return typeof number === "number" && Number.isFinite(number) ? number : null;
}

/** 2.5.2 stored `edited` as 0/1 (expo-sqlite binds booleans as integers). */
function toBoolean(value: unknown): boolean {
  if (typeof value === "string") return value === "1" || value.toLowerCase() === "true";
  return value === 1 || value === 1n || value === true;
}

/** Years came from tags: `2019`, `'2019'`, `'2019-05-01'`; 2.5.2 stored 0 as null. */
function toYear(value: unknown): number | null {
  const leading = typeof value === "string" ? /^\s*(\d{1,4})/.exec(value)?.[1] : value;
  const number = toNumber(leading);
  return number !== null && Number.isInteger(number) && number > 0 ? number : null;
}

/** Track numbers: `3`, `'3'`, `'3/12'`; 2.5.2 stored 0 as null. */
function toTrack(value: unknown): number | null {
  const leading = typeof value === "string" ? /^\s*(\d+)/.exec(value)?.[1] : value;
  const number = toNumber(leading);
  return number !== null && number > 0 ? Math.trunc(number) : null;
}
