/**
 * What importing the real 2.5.2 fixture must produce, beyond the library
 * itself (`real-fixture-expected.ts`): settings, warnings, counts, artwork
 * and track order, and the assertion both `real-fixture.test.ts` and the
 * simulator upgrade test (`scripts/verify-upgrade.ts`) run.
 */
import assert from "node:assert/strict";
import { readdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { sql } from "drizzle-orm";

import type { LibraryDb } from "../client.ts";
import { getSong, listAlbumTracks } from "../index.ts";
import { dumpLibrary } from "./dump-library.ts";
import { expectedLibrary } from "./real-fixture-expected.ts";
import { NOW } from "./run-import.ts";

/** Each song's effective cover as 3.0 resolves it: `[kind, id]`, or null for the placeholder. */
export const EFFECTIVE_ARTWORK = {
  1: ["album", 1],
  2: ["album", 1],
  3: ["album", 1],
  4: ["album", 1],
  5: ["album", 1],
  6: ["album", 2],
  7: ["album", 2],
  8: ["album", 2],
  9: null,
  10: ["song", 10],
  11: null,
  13: null,
  14: null,
  15: null,
  16: null,
  17: null,
  18: null,
  19: ["album", 4],
  20: ["album", 4],
};

/** Album → song ids in track order, as 2.5.2 showed them. */
export const ALBUM_TRACKS = {
  1: [1, 2, 3, 4, 5],
  2: [6, 7, 8],
  3: [17, 9],
  4: [20, 19],
  5: [11, 2, 17, 10],
};

export const EXPECTED_SETTINGS = {
  preferences: {
    accent: "#a888ec",
    haptics: false,
    shuffle: true,
    repeat: "all",
  },
  session: {
    queueSongIds: [7, 6, 3, 14, 2, 8, 20, 3, 6, 7, 1],
    currentIndex: 4,
    positionMs: 7548,
    source: { kind: "playlist", id: 4 },
    insertOffset: 2,
  },
  bookkeeping: {
    importCount: 1,
    reviewRequested: true,
    exportNumber: null,
    legacyDbVersion: 2,
  },
  unknownKeys: [],
};

export const EXPECTED_WARNINGS = [
  {
    code: "title-from-file-name",
    message: "Titled untitled songs with their file name (5)",
    ids: [13, 14, 15, 16, 18],
  },
  {
    code: "orphan-join-rows",
    message: "Dropped orphan rows: artistSongs 1, playlistSongs 2",
  },
  {
    code: "packed-track-number",
    message: "Decoded packed m4a track numbers (3)",
    ids: [6, 7, 8],
  },
];

export const EXPECTED_COUNTS = {
  songs: 19,
  artists: 7,
  albums: 5,
  playlists: 4,
  songArtists: 27,
  albumSongs: 16,
  albumArtists: 11,
  playlistSongs: 21,
};

/** `dumpLibrary` with artwork versions as presence and file names in NFC. */
export function comparableLibrary(db: LibraryDb) {
  const library = dumpLibrary(db);
  function presence<T extends { artworkVersion: number | null }>(row: T) {
    const { artworkVersion, ...rest } = row;
    return { ...rest, artwork: artworkVersion !== null };
  }
  return {
    ...library,
    songs: library.songs.map((song) => {
      const { id, title, filePath, mimeType, durationMs } = song;
      return {
        id,
        title,
        filePath: filePath?.normalize("NFC") ?? null,
        mimeType,
        durationMs,
        artwork: song.artworkVersion !== null,
        addedAt: song.addedAt,
        modifiedSinceExport: song.modifiedSinceExport,
      };
    }),
    artists: library.artists.map(presence),
    albums: library.albums.map(presence),
    playlists: library.playlists.map(presence),
  };
}

/**
 * Asserts `db` holds exactly the fixture's library, imported at `now`, with
 * every stored audio path naming its file under `root` byte for byte.
 * `fileNames` is for a copy of the fixture with files renamed.
 */
export function assertExactLibrary(
  db: LibraryDb,
  root: string,
  now = NOW,
  fileNames: Readonly<Record<number, string>> = {},
) {
  assert.deepEqual(comparableLibrary(db), expectedLibrary(now, fileNames));
  assert.deepEqual(db.all(sql`PRAGMA foreign_key_check`), []);

  // The app opens each song by its stored path, so it must be the bytes on disk.
  for (const song of dumpLibrary(db).songs) {
    assert.ok(song.filePath, `song ${song.id} has a file`);
    const name = song.filePath.slice(song.filePath.lastIndexOf("/") + 1);
    assert.ok(
      readdirSync(join(root, dirname(song.filePath))).includes(name),
      `song ${song.id}: ${song.filePath} is the on-disk name`,
    );
  }

  for (const [songId, expected] of Object.entries(EFFECTIVE_ARTWORK)) {
    const artwork = getSong(db, Number(songId))?.artwork ?? null;
    assert.deepEqual(
      artwork && [artwork.kind, artwork.id],
      expected,
      `song ${songId} artwork`,
    );
  }
  for (const [albumId, songIds] of Object.entries(ALBUM_TRACKS)) {
    assert.deepEqual(
      listAlbumTracks(db, Number(albumId)).map((song) => song.id),
      songIds,
      `album ${albumId} track order`,
    );
  }

  const sequences = Object.fromEntries(
    db
      .all<{
        name: string;
        seq: number;
      }>(sql`SELECT name, seq FROM sqlite_sequence`)
      .map((row) => [row.name, row.seq]),
  );
  // 2.5.2's counters carry over, so deleted playlist 6's id is never reissued.
  assert.equal(sequences.songs, 20);
  assert.equal(sequences.playlists, 6);
  assert.equal(sequences.playlist_songs, 46);
}
