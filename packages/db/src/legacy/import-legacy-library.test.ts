import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { cpSync, mkdirSync, readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";
import { describe, test } from "node:test";

import { sql } from "drizzle-orm";

import { addSongs } from "../library/songs.ts";
import { dumpLibrary } from "../testing/dump-library.ts";
import { nodeFileSystem, openLegacyDatabaseFile } from "../testing/node-fs.ts";
import { openTestLibraryDb } from "../testing/node-sqlite.ts";
import { buildSyntheticInstall, COVER_MTIMES, NFD_FILE_NAME, type SyntheticInstall } from "../testing/synthetic-install.ts";
import {
  findLegacyBackupRoot,
  getLegacyImport,
  importLegacyLibrary,
  LegacyImportError,
  readLegacyAsyncStorage,
  type ImportLegacyLibraryOptions,
  type LegacySettings,
} from "./index.ts";

const NOW = 1_800_000_000_000;
const ms = (seconds: number) => seconds * 1000;

async function runImport(install: SyntheticInstall, overrides: Partial<ImportLegacyLibraryOptions> = {}) {
  const target = overrides.targetDb ? { db: overrides.targetDb } : await openTestLibraryDb();
  const legacy = openLegacyDatabaseFile(install.dbPath);
  try {
    const result = await importLegacyLibrary({
      legacyDb: legacy.legacyDb,
      targetDb: target.db,
      fs: nodeFileSystem,
      root: install.documents,
      source: "install",
      asyncStorage: await readLegacyAsyncStorage(install.asyncStorageDir, nodeFileSystem),
      now: NOW,
      ...overrides,
    });
    return { db: target.db, result };
  } finally {
    legacy.close();
  }
}

/** Content hash of every file under a directory, to prove the import wrote nothing. */
function hashTree(dir: string): Record<string, string> {
  const result: Record<string, string> = {};
  const walk = (current: string) => {
    for (const name of readdirSync(current)) {
      const path = join(current, name);
      if (statSync(path).isDirectory()) walk(path);
      else result[path.slice(dir.length)] = createHash("sha256").update(readFileSync(path)).digest("hex");
    }
  };
  walk(dir);
  return result;
}

const EXPECTED_LIBRARY = {
  songs: [
    { id: 1, title: "See You Again", filePath: "library/1/01 See You Again.mp3", mimeType: "audio/mpeg", durationMs: 180_000, artworkVersion: null, addedAt: NOW - 10, modifiedSinceExport: false },
    { id: 2, title: "After the Storm", filePath: "library/2/After the Storm #2 & more.m4a", mimeType: "audio/mp4", durationMs: 207_000, artworkVersion: null, addedAt: NOW - 9, modifiedSinceExport: true },
    { id: 3, title: "ON", filePath: "library/3/ON.mp3", mimeType: "audio/mpeg", durationMs: 246_000, artworkVersion: ms(COVER_MTIMES.song3), addedAt: NOW - 8, modifiedSinceExport: false },
    { id: 4, title: "on", filePath: "library/4/on.mp3", mimeType: "audio/mpeg", durationMs: 100_000, artworkVersion: null, addedAt: NOW - 7, modifiedSinceExport: false },
    { id: 5, title: "Formation", filePath: "library/5/Formation.flac", mimeType: "audio/flac", durationMs: 206_000, artworkVersion: null, addedAt: NOW - 6, modifiedSinceExport: false },
    { id: 6, title: "Café del Mar", filePath: `library/6/${NFD_FILE_NAME}`, mimeType: "audio/mpeg", durationMs: 300_000, artworkVersion: ms(COVER_MTIMES.song6), addedAt: NOW - 5, modifiedSinceExport: false },
    { id: 7, title: "Ghost Track", filePath: "library/7/missing.mp3", mimeType: "audio/mpeg", durationMs: 1_000, artworkVersion: null, addedAt: NOW - 4, modifiedSinceExport: false },
    { id: 8, title: "Nameless", filePath: "library/8/track.m4a", mimeType: "audio/mp4", durationMs: 50_000, artworkVersion: null, addedAt: NOW - 3, modifiedSinceExport: false },
    { id: 10, title: "Half Imported", filePath: "library/10/half.mp3", mimeType: "audio/mpeg", durationMs: 60_000, artworkVersion: null, addedAt: NOW - 2, modifiedSinceExport: false },
    { id: 12, title: "夜に駆ける", filePath: "library/12/夜に駆ける.mp3", mimeType: "audio/mpeg", durationMs: 0, artworkVersion: null, addedAt: NOW - 1, modifiedSinceExport: false },
  ],
  artists: [
    { id: 1, name: "Tyler, The Creator", artworkVersion: null, addedAt: NOW - 7 },
    { id: 2, name: "Kali Uchis", artworkVersion: null, addedAt: NOW - 6 },
    { id: 3, name: "BTS", artworkVersion: ms(COVER_MTIMES.artist3), addedAt: NOW - 5 },
    { id: 4, name: "bts", artworkVersion: null, addedAt: NOW - 4 },
    { id: 5, name: "Beyoncé", artworkVersion: null, addedAt: NOW - 3 },
    { id: 6, name: "Empty Artist", artworkVersion: null, addedAt: NOW - 2 },
    { id: 7, name: "YOASOBI", artworkVersion: null, addedAt: NOW - 1 },
  ],
  albums: [
    { id: 1, name: "Flower Boy", year: 2017, artworkVersion: ms(COVER_MTIMES.album1), addedAt: NOW - 6 },
    { id: 2, name: "Isolation", year: 2018, artworkVersion: null, addedAt: NOW - 5 },
    { id: 3, name: "Map of the Soul: 7", year: null, artworkVersion: null, addedAt: NOW - 4 },
    { id: 4, name: "Lemonade", year: 2016, artworkVersion: ms(COVER_MTIMES.album4), addedAt: NOW - 3 },
    { id: 5, name: "Empty Album", year: null, artworkVersion: null, addedAt: NOW - 2 },
    { id: 6, name: "Compilation", year: null, artworkVersion: ms(COVER_MTIMES.album6), addedAt: NOW - 1 },
  ],
  playlists: [
    { id: 2, name: "Favs ♥", kind: "liked", artworkVersion: ms(COVER_MTIMES.playlist2), createdAt: NOW - 3, updatedAt: NOW - 3 },
    { id: 3, name: "Road Trip", kind: "user", artworkVersion: ms(COVER_MTIMES.playlist3), createdAt: NOW - 2, updatedAt: NOW - 2 },
    { id: 5, name: "Gym & Run", kind: "user", artworkVersion: null, createdAt: NOW - 1, updatedAt: NOW - 1 },
  ],
  songArtists: [
    { songId: 1, artistId: 1, position: 0 },
    { songId: 1, artistId: 2, position: 1 },
    { songId: 2, artistId: 2, position: 0 },
    { songId: 3, artistId: 3, position: 0 },
    { songId: 4, artistId: 4, position: 0 },
    { songId: 5, artistId: 5, position: 0 },
    { songId: 12, artistId: 7, position: 0 },
  ],
  albumSongs: [
    { albumId: 1, songId: 1, track: 1, position: 0 },
    { albumId: 2, songId: 2, track: 3, position: 0 },
    { albumId: 6, songId: 2, track: 9, position: 1 },
    { albumId: 3, songId: 3, track: null, position: 0 },
    { albumId: 4, songId: 5, track: 12, position: 0 },
  ],
  albumArtists: [
    { albumId: 1, artistId: 1, position: 0 },
    { albumId: 1, artistId: 2, position: 1 },
    { albumId: 2, artistId: 2, position: 0 },
    { albumId: 3, artistId: 3, position: 0 },
    { albumId: 4, artistId: 5, position: 0 },
    { albumId: 6, artistId: 2, position: 0 },
  ],
  playlistSongs: [
    { id: 12, playlistId: 2, songId: 3, position: 1 },
    { id: 13, playlistId: 2, songId: 1, position: 2 },
    { id: 14, playlistId: 2, songId: 5, position: 3 },
    { id: 15, playlistId: 3, songId: 2, position: 1 },
    { id: 16, playlistId: 3, songId: 1, position: 2 },
    { id: 18, playlistId: 3, songId: 6, position: 3 },
    { id: 19, playlistId: 3, songId: 7, position: 4 },
    { id: 22, playlistId: 5, songId: 12, position: 1 },
    { id: 23, playlistId: 5, songId: 4, position: 2 },
  ],
};

const EXPECTED_SETTINGS: LegacySettings = {
  preferences: { accent: "#a888ec", haptics: false, shuffle: true, repeat: "all" },
  session: {
    queueSongIds: [1, 2, 6, 12, 10],
    currentIndex: 2,
    positionMs: 42_700,
    source: { kind: "playlist", id: 3 },
    insertOffset: 1,
  },
  premiumCache: { kind: "lifetime" },
  ads: { listenedMs: 455_000, due: true },
  bookkeeping: { importCount: 4, reviewRequested: true, exportNumber: 2, legacyDbVersion: 2 },
  unknownKeys: ["somethingNew"],
};

describe("importLegacyLibrary (synthetic 2.5.2 install)", () => {
  test("migrates the whole library exactly", async () => {
    const install = buildSyntheticInstall();
    const { db, result } = await runImport(install);
    assert.equal(result.status, "imported");
    assert.deepEqual(dumpLibrary(db), EXPECTED_LIBRARY);
    assert.deepEqual(result.counts, {
      songs: 10,
      artists: 7,
      albums: 6,
      playlists: 3,
      songArtists: 7,
      albumSongs: 5,
      albumArtists: 6,
      playlistSongs: 9,
    });
  });

  test("returns the settings and playback session from AsyncStorage", async () => {
    const { db, result } = await runImport(buildSyntheticInstall());
    assert.equal(result.status, "imported");
    assert.deepEqual(result.settings, EXPECTED_SETTINGS);
    // Also stored, so the app can re-apply them after a crash between commit and kv-store write.
    assert.deepEqual(getLegacyImport(db)?.settings, EXPECTED_SETTINGS);
  });

  test("reports every edge case it handled", async () => {
    const { result } = await runImport(buildSyntheticInstall());
    assert.equal(result.status, "imported");
    const byCode = Object.fromEntries(result.warnings.map((w) => [w.code, w]));
    assert.deepEqual(Object.keys(byCode).sort(), [
      "audio-file-missing",
      "audio-file-recovered",
      "duplicate-join-rows",
      "hidden-song-imported",
      "hidden-song-skipped",
      "orphan-folders",
      "orphan-join-rows",
      "partial-artwork",
    ]);
    assert.deepEqual(byCode["audio-file-missing"]?.ids, [7]);
    assert.deepEqual(byCode["audio-file-recovered"]?.ids, [8]);
    assert.deepEqual(byCode["hidden-song-skipped"]?.ids, [9]);
    assert.deepEqual(byCode["hidden-song-imported"]?.ids, [10]);
    assert.match(byCode["orphan-join-rows"]?.message ?? "", /artistSongs 2, albumSongs 1, artistsAlbums 1, playlistSongs 2/);
    assert.match(byCode["duplicate-join-rows"]?.message ?? "", /artistSongs 1, albumSongs 1, artistsAlbums 1, playlistSongs 1/);
    assert.match(byCode["orphan-folders"]?.message ?? "", /albums\/77, library\/11/);
    assert.match(byCode["partial-artwork"]?.message ?? "", /album 4/);
  });

  test("carries sqlite_sequence over so 2.5.2 ids are never reissued", async () => {
    const { db } = await runImport(buildSyntheticInstall());
    const sequences = Object.fromEntries(
      db.all<{ name: string; seq: number }>(sql`SELECT name, seq FROM sqlite_sequence`).map((r) => [r.name, r.seq]),
    );
    // Song 13 was the last 2.5.2 import (deleted); playlist 5 the last playlist; playlistSongs reached 23.
    assert.equal(sequences.songs, 13);
    assert.equal(sequences.playlists, 5);
    assert.equal(sequences.playlist_songs, 23);
    const added = addSongs(db, [{ title: "New", fileName: "new.mp3", durationMs: 1 }], { now: NOW });
    assert.equal(added.value[0]?.id, 14);
  });

  test("never modifies legacy files", async () => {
    const install = buildSyntheticInstall();
    const before = hashTree(install.container);
    await runImport(install);
    assert.deepEqual(hashTree(install.container), before);
  });

  test("is idempotent", async () => {
    const install = buildSyntheticInstall();
    const first = await runImport(install);
    assert.equal(first.result.status, "imported");
    const snapshot = dumpLibrary(first.db);
    const second = await runImport(install, { targetDb: first.db, now: NOW + 5_000 });
    assert.deepEqual(second.result, {
      status: "already-imported",
      importId: first.result.status === "imported" ? first.result.importId : -1,
      importedAt: NOW,
      settings: EXPECTED_SETTINGS,
    });
    assert.deepEqual(dumpLibrary(first.db), snapshot);
  });

  test("rolls back everything when the import fails midway, and the retry succeeds", async () => {
    const install = buildSyntheticInstall();
    const { db } = await openTestLibraryDb();
    const empty = dumpLibrary(db);
    await assert.rejects(
      runImport(install, {
        targetDb: db,
        onProgress: (step) => {
          if (step === "verifying") throw new Error("simulated crash after writing every table");
        },
      }),
      /simulated crash/,
    );
    assert.deepEqual(dumpLibrary(db), empty);
    assert.equal(getLegacyImport(db), null);

    const retry = await runImport(install, { targetDb: db });
    assert.equal(retry.result.status, "imported");
    assert.deepEqual(dumpLibrary(db), EXPECTED_LIBRARY);
  });

  test("refuses to import over a 3.0 library unless replacing it", async () => {
    const install = buildSyntheticInstall();
    const { db } = await openTestLibraryDb();
    addSongs(db, [{ title: "Made in 3.0", fileName: "a.mp3", durationMs: 1 }], { now: NOW });
    await assert.rejects(runImport(install, { targetDb: db }), (error: unknown) => {
      return error instanceof LegacyImportError && error.code === "target-not-empty";
    });
    const replaced = await runImport(install, { targetDb: db, replaceExisting: true, source: "backup", asyncStorage: null });
    assert.equal(replaced.result.status, "imported");
    assert.deepEqual(dumpLibrary(db), EXPECTED_LIBRARY);
  });

  test("tolerates an empty auto-created Liked Songs in the target", async () => {
    const { db } = await openTestLibraryDb();
    db.run(sql`INSERT INTO playlists (id, name, kind, created_at, updated_at) VALUES (1, 'Liked Songs', 'liked', 1, 1)`);
    const { result } = await runImport(buildSyntheticInstall(), { targetDb: db });
    assert.equal(result.status, "imported");
    assert.deepEqual(dumpLibrary(db).playlists, EXPECTED_LIBRARY.playlists);
  });

  test("imports a v1-era database (no albumSongs.track)", async () => {
    const { db, result } = await runImport(buildSyntheticInstall({ v1: true }));
    assert.equal(result.status, "imported");
    const library = dumpLibrary(db);
    assert.deepEqual(
      library.albumSongs,
      EXPECTED_LIBRARY.albumSongs.map((row) => ({ ...row, track: null })),
    );
    assert.deepEqual(library.songs, EXPECTED_LIBRARY.songs);
    assert.ok(result.warnings.some((w) => w.code === "missing-column" && /albumSongs is missing track/.test(w.message)));
  });

  test("restores a 2.5.2 backup zip root (no AsyncStorage)", async () => {
    const install = buildSyntheticInstall();
    // 2.5.2 zipped Documents/ itself; an extracted zip may also sit one folder down.
    const extracted = join(install.container, "extracted");
    mkdirSync(extracted);
    // Unzipping may reset mtimes, which only changes artwork_version (a cache-buster); keep them to compare.
    cpSync(install.documents, join(extracted, "SYNQ Backup"), { recursive: true, preserveTimestamps: true });
    const root = await findLegacyBackupRoot(nodeFileSystem, extracted);
    assert.equal(root, join(extracted, "SYNQ Backup"));
    const { db, result } = await runImport(
      { ...install, documents: root ?? "", dbPath: join(root ?? "", "SQLite", "synq.db") },
      { source: "backup", asyncStorage: null },
    );
    assert.equal(result.status, "imported");
    assert.equal(result.settings, null);
    assert.deepEqual(dumpLibrary(db), EXPECTED_LIBRARY);
    assert.equal(getLegacyImport(db)?.source, "backup");
    assert.equal(await findLegacyBackupRoot(nodeFileSystem, join(install.container, "Library")), null);
  });

  test("survives a database missing whole tables", async () => {
    const install = buildSyntheticInstall();
    const { DatabaseSync } = await import("node:sqlite");
    const raw = new DatabaseSync(install.dbPath);
    raw.exec("DROP TABLE artistsAlbums; DROP TABLE albums;");
    raw.close();
    const { db, result } = await runImport(install);
    assert.equal(result.status, "imported");
    const library = dumpLibrary(db);
    assert.equal(library.albums.length, 0);
    assert.equal(library.albumSongs.length, 0);
    assert.equal(library.songs.length, 10);
    assert.deepEqual(
      result.warnings.filter((w) => w.code === "missing-table").map((w) => w.message),
      ["Table albums is missing", "Table artistsAlbums is missing"],
    );
  });

  test("recreates Liked Songs when playlist 2's row is gone, keeping its likes", async () => {
    const install = buildSyntheticInstall();
    const { DatabaseSync } = await import("node:sqlite");
    const raw = new DatabaseSync(install.dbPath);
    raw.exec("DELETE FROM playlists WHERE id = 2;");
    raw.close();
    const { db } = await runImport(install);
    const library = dumpLibrary(db);
    assert.deepEqual(library.playlists[0], { ...EXPECTED_LIBRARY.playlists[0], name: "Liked Songs" });
    assert.deepEqual(
      library.playlistSongs.filter((row) => row.playlistId === 2).map((row) => row.songId),
      [3, 1, 5],
    );
  });

});
