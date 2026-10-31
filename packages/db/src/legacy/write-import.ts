/**
 * The writing half of the import: the guards that keep it from running over a
 * real 3.0 library, the chunked inserts, the `sqlite_sequence` carry-over, and
 * the checks that make the transaction roll back instead of committing a
 * partial library.
 */
import type { SQLiteTable } from "drizzle-orm/sqlite-core";
import { count, eq, sql } from "drizzle-orm";

import type { LibraryDb } from "../client.ts";
import type { LegacyImportCounts } from "../schema.ts";
import type { ImportPlan } from "./plan-import.ts";
import { changesOf } from "../library/changes.ts";
import {
  albumArtists,
  albums,
  albumSongs,
  artists,
  legacyImport,
  playlists,
  playlistSongs,
  songArtists,
  songs,
} from "../schema.ts";
import { LegacyImportError } from "./import-error.ts";

/**
 * The import assumes it runs before the 3.0 UI ever wrote to library.db. An
 * empty, auto-created Liked Songs is tolerated (it is replaced by 2.5.2's).
 */
export function assertTargetEmpty(db: LibraryDb, removePlaceholder: boolean) {
  function total(table: SQLiteTable) {
    return db.select({ n: count() }).from(table).get()?.n ?? 0;
  }
  const userPlaylists =
    db
      .select({ n: count() })
      .from(playlists)
      .where(eq(playlists.kind, "user"))
      .get()?.n ?? 0;
  if (
    total(songs) +
      total(artists) +
      total(albums) +
      total(playlistSongs) +
      userPlaylists >
    0
  ) {
    throw new LegacyImportError(
      "target-not-empty",
      "library.db already has a library; pass replaceExisting to restore over it",
    );
  }
  if (removePlaceholder) db.delete(playlists).run();
}

export function clearLibrary(db: LibraryDb) {
  for (const table of [
    playlistSongs,
    albumArtists,
    albumSongs,
    songArtists,
    playlists,
    songs,
    albums,
    artists,
    legacyImport,
  ]) {
    db.delete(table).run();
  }
}

/** Inserts every planned row, parents before the join rows that reference them. */
export function insertPlan(db: LibraryDb, plan: ImportPlan) {
  insertChunked(db, artists, plan.artists);
  insertChunked(db, albums, plan.albums);
  insertChunked(db, songs, plan.songs);
  insertChunked(db, playlists, plan.playlists);
  insertChunked(db, songArtists, plan.songArtists);
  insertChunked(db, albumSongs, plan.albumSongs);
  insertChunked(db, albumArtists, plan.albumArtists);
  insertChunked(db, playlistSongs, plan.playlistSongs);
}

/** Small batches keep each statement well under SQLite's bound-parameter limit. */
function insertChunked<T extends SQLiteTable>(
  db: LibraryDb,
  table: T,
  rows: readonly T["$inferInsert"][],
) {
  for (let start = 0; start < rows.length; start += 100) {
    db.insert(table)
      .values(rows.slice(start, start + 100))
      .run();
  }
}

const SEQUENCE_TABLES = {
  songs: "songs",
  albums: "albums",
  artists: "artists",
  playlists: "playlists",
  playlistSongs: "playlist_songs",
};

/**
 * Raises each AUTOINCREMENT counter to at least 2.5.2's, so a song deleted
 * in 2.5.2 (whose folder may linger) never has its id reused.
 */
export function carrySequences(db: LibraryDb, legacy: Record<string, number>) {
  for (const [legacyName, table] of Object.entries(SEQUENCE_TABLES)) {
    const seq = legacy[legacyName];
    if (seq === undefined) continue;
    const updated = changesOf(
      db.run(
        sql`UPDATE sqlite_sequence SET seq = max(seq, ${seq}) WHERE name = ${table}`,
      ),
    );
    if (updated === 0) {
      db.run(
        sql`INSERT INTO sqlite_sequence (name, seq) VALUES (${table}, ${seq})`,
      );
    }
  }
}

export function verify(db: LibraryDb, expected: LegacyImportCounts) {
  const tables = [
    ["songs", songs],
    ["artists", artists],
    ["albums", albums],
    ["playlists", playlists],
    ["songArtists", songArtists],
    ["albumSongs", albumSongs],
    ["albumArtists", albumArtists],
    ["playlistSongs", playlistSongs],
  ] as const;
  for (const [key, table] of tables) {
    const actual = db.select({ n: count() }).from(table).get()?.n ?? 0;
    if (actual !== expected[key]) {
      throw new LegacyImportError(
        "verification-failed",
        `${key}: wrote ${actual} rows, expected ${expected[key]}`,
      );
    }
  }
  const violations = db.all(sql`PRAGMA foreign_key_check`);
  if (violations.length > 0) {
    throw new LegacyImportError(
      "verification-failed",
      `${violations.length} foreign key violations`,
    );
  }
}
