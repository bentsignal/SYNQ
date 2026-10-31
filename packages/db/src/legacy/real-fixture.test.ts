/**
 * Imports the real 2.5.2 install captured from the simulator
 * (`fixtures/legacy-2.5.2/`, see its README and EXPECTED.md) and asserts the
 * exact library a 2.5.2 user built through the app's UI, then restores the
 * real 2.5.2 backup zip of the same library and asserts the same result.
 *
 * Artwork is asserted by presence: `artwork_version` is the cover's mtime,
 * which a git checkout or an unzip resets. File names are compared ignoring
 * Unicode normalization (git on macOS stores NFD names as NFC), and each
 * stored path must also name a file on disk byte-for-byte. The backup zip
 * keeps the device's exact bytes, so its test pins the NFD names too.
 */
import assert from "node:assert/strict";
import { existsSync, readdirSync, rmSync } from "node:fs";
import { dirname, join } from "node:path";
import { describe, test } from "node:test";
import { fileURLToPath } from "node:url";
import { sql } from "drizzle-orm";

import type { LibraryDb } from "../client.ts";
import { getSong, listAlbumTracks } from "../index.ts";
import { dumpLibrary } from "../testing/dump-library.ts";
import { nodeFileSystem, openLegacyDatabaseFile } from "../testing/node-fs.ts";
import { openTestLibraryDb } from "../testing/node-sqlite.ts";
import { expectedLibrary } from "../testing/real-fixture-expected.ts";
import { hashTree, NOW } from "../testing/run-import.ts";
import { BUNDLE_ID } from "../testing/synthetic-install.ts";
import { extractZip } from "../testing/unzip.ts";
import {
  findLegacyBackupRoot,
  importLegacyLibrary,
  LEGACY_DB_PATH,
  readLegacyAsyncStorage,
} from "./index.ts";

const fixture = join(
  dirname(fileURLToPath(import.meta.url)),
  "../../fixtures/legacy-2.5.2",
);
const container = join(fixture, "container");
const documents = join(container, "Documents");
const asyncStorageDir = join(
  container,
  "Library",
  "Application Support",
  BUNDLE_ID,
  "RCTAsyncLocalStorage_V1",
);
const backupZip = join(fixture, "backup", "synq-2.5.2-backup.zip");

/** Each song's effective cover as 3.0 resolves it: `[kind, id]`, or null for the placeholder. */
const EFFECTIVE_ARTWORK = {
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
const ALBUM_TRACKS = {
  1: [1, 2, 3, 4, 5],
  2: [6, 7, 8],
  3: [17, 9],
  4: [20, 19],
  5: [11, 2, 17, 10],
};

const EXPECTED_SETTINGS = {
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
  premiumCache: { kind: "lifetime" },
  ads: { listenedMs: 0, due: false },
  bookkeeping: {
    importCount: 1,
    reviewRequested: true,
    exportNumber: null,
    legacyDbVersion: 2,
  },
  unknownKeys: [],
};

const EXPECTED_WARNINGS = [
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

const EXPECTED_COUNTS = {
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
function comparableLibrary(db: LibraryDb) {
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

function assertExactLibrary(db: LibraryDb, root: string) {
  assert.deepEqual(comparableLibrary(db), expectedLibrary());
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

async function importRoot(
  db: LibraryDb,
  options: {
    root: string;
    source: "install" | "backup";
    asyncStorageDir: string | null;
    replaceExisting?: boolean;
  },
) {
  const legacy = openLegacyDatabaseFile(join(options.root, LEGACY_DB_PATH));
  try {
    return await importLegacyLibrary({
      legacyDb: legacy.legacyDb,
      targetDb: db,
      fs: nodeFileSystem,
      root: options.root,
      source: options.source,
      asyncStorage: options.asyncStorageDir
        ? await readLegacyAsyncStorage(options.asyncStorageDir, nodeFileSystem)
        : null,
      replaceExisting: options.replaceExisting ?? false,
      now: NOW,
    });
  } finally {
    legacy.close();
  }
}

void describe("the real 2.5.2 fixture", () => {
  void test("imports the captured install exactly, without touching it", async () => {
    assert.ok(existsSync(join(documents, LEGACY_DB_PATH)), "fixture present");
    const before = hashTree(container);
    const { db } = await openTestLibraryDb();
    const result = await importRoot(db, {
      root: documents,
      source: "install",
      asyncStorageDir,
    });
    assert.deepEqual(hashTree(container), before);

    assert.equal(result.status, "imported");
    assert.deepEqual(result.counts, EXPECTED_COUNTS);
    assert.deepEqual(result.settings, EXPECTED_SETTINGS);
    assert.deepEqual(result.warnings, EXPECTED_WARNINGS);
    assertExactLibrary(db, documents);
  });

  void test("restores the real 2.5.2 backup zip to the same library", async (t) => {
    const extracted = extractZip(backupZip);
    t.after(() => rmSync(extracted, { recursive: true, force: true }));
    const root = await findLegacyBackupRoot(nodeFileSystem, extracted);
    assert.equal(root, extracted);

    // Restore over an imported library, as Settings > Restore would.
    const { db } = await openTestLibraryDb();
    await importRoot(db, {
      root: documents,
      source: "install",
      asyncStorageDir,
    });
    const before = hashTree(extracted);
    const result = await importRoot(db, {
      root: extracted,
      source: "backup",
      asyncStorageDir: null,
      replaceExisting: true,
    });
    assert.deepEqual(hashTree(extracted), before);

    assert.equal(result.status, "imported");
    assert.deepEqual(result.counts, EXPECTED_COUNTS);
    assert.equal(result.settings, null);
    assert.deepEqual(result.warnings, EXPECTED_WARNINGS);
    assertExactLibrary(db, extracted);

    // The zip has the device's bytes: song 10's name is NFD on disk but NFC
    // in synq.db, song 18's NFD in both. The stored paths are the disk's.
    const songs = new Map(dumpLibrary(db).songs.map((s) => [s.id, s.filePath]));
    assert.equal(songs.get(10), "library/10/Café Ünïcødé.mp3".normalize("NFD"));
    assert.equal(
      songs.get(18),
      "library/18/Saoirse Ní Bhriain - Dew Point.flac".normalize("NFD"),
    );
  });
});
