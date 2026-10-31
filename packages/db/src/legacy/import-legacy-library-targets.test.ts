import assert from "node:assert/strict";
import { cpSync, mkdirSync } from "node:fs";
import { join } from "node:path";
import { describe, test } from "node:test";
import { sql } from "drizzle-orm";

import { addSongs } from "../library/song-writes.ts";
import { dumpLibrary } from "../testing/dump-library.ts";
import { EXPECTED_LIBRARY } from "../testing/expected-import.ts";
import { nodeFileSystem } from "../testing/node-fs.ts";
import { openTestLibraryDb } from "../testing/node-sqlite.ts";
import { NOW, runImport } from "../testing/run-import.ts";
import { buildSyntheticInstall } from "../testing/synthetic-install.ts";
import {
  findLegacyBackupRoot,
  getLegacyImport,
  LegacyImportError,
} from "./index.ts";

void describe("importLegacyLibrary (unusual targets and sources)", () => {
  void test("refuses to import over a 3.0 library unless replacing it", async () => {
    const install = buildSyntheticInstall();
    const { db } = await openTestLibraryDb();
    addSongs(db, [{ title: "Made in 3.0", fileName: "a.mp3", durationMs: 1 }], {
      now: NOW,
    });
    await assert.rejects(
      runImport(install, { targetDb: db }),
      (error: unknown) => {
        return (
          error instanceof LegacyImportError &&
          error.code === "target-not-empty"
        );
      },
    );
    const replaced = await runImport(install, {
      targetDb: db,
      replaceExisting: true,
      source: "backup",
      asyncStorage: null,
    });
    assert.equal(replaced.result.status, "imported");
    assert.deepEqual(dumpLibrary(db), EXPECTED_LIBRARY);
  });

  void test("tolerates an empty auto-created Liked Songs in the target", async () => {
    const { db } = await openTestLibraryDb();
    db.run(
      sql`INSERT INTO playlists (id, name, kind, created_at, updated_at) VALUES (1, 'Liked Songs', 'liked', 1, 1)`,
    );
    const { result } = await runImport(buildSyntheticInstall(), {
      targetDb: db,
    });
    assert.equal(result.status, "imported");
    assert.deepEqual(dumpLibrary(db).playlists, EXPECTED_LIBRARY.playlists);
  });
});

void describe("importLegacyLibrary (older and partial installs)", () => {
  void test("imports a v1-era database (no albumSongs.track)", async () => {
    const { db, result } = await runImport(buildSyntheticInstall({ v1: true }));
    assert.equal(result.status, "imported");
    const library = dumpLibrary(db);
    assert.deepEqual(
      library.albumSongs,
      EXPECTED_LIBRARY.albumSongs.map((row) => ({ ...row, track: null })),
    );
    assert.deepEqual(library.songs, EXPECTED_LIBRARY.songs);
    assert.ok(
      result.warnings.some(
        (w) =>
          w.code === "missing-column" &&
          w.message.includes("albumSongs is missing track"),
      ),
    );
  });

  void test("restores a 2.5.2 backup zip root (no AsyncStorage)", async () => {
    const install = buildSyntheticInstall();
    // 2.5.2 zipped Documents/ itself; an extracted zip may also sit one folder down.
    const extracted = join(install.container, "extracted");
    mkdirSync(extracted);
    // Unzipping may reset mtimes, which only changes artwork_version (a cache-buster); keep them to compare.
    cpSync(install.documents, join(extracted, "SYNQ Backup"), {
      recursive: true,
      preserveTimestamps: true,
    });
    const root = await findLegacyBackupRoot(nodeFileSystem, extracted);
    assert.equal(root, join(extracted, "SYNQ Backup"));
    const { db, result } = await runImport(
      {
        ...install,
        documents: root,
        dbPath: join(root, "SQLite", "synq.db"),
      },
      { source: "backup", asyncStorage: null },
    );
    assert.equal(result.status, "imported");
    assert.equal(result.settings, null);
    assert.deepEqual(dumpLibrary(db), EXPECTED_LIBRARY);
    assert.equal(getLegacyImport(db)?.source, "backup");
    assert.equal(
      await findLegacyBackupRoot(
        nodeFileSystem,
        join(install.container, "Library"),
      ),
      null,
    );
  });

  void test("survives a database missing whole tables", async () => {
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
    assert.equal(library.songs.length, 13);
    assert.deepEqual(
      result.warnings
        .filter((w) => w.code === "missing-table")
        .map((w) => w.message),
      ["Table albums is missing", "Table artistsAlbums is missing"],
    );
  });

  void test("recreates Liked Songs when playlist 2's row is gone, keeping its likes", async () => {
    const install = buildSyntheticInstall();
    const { DatabaseSync } = await import("node:sqlite");
    const raw = new DatabaseSync(install.dbPath);
    raw.exec("DELETE FROM playlists WHERE id = 2;");
    raw.close();
    const { db } = await runImport(install);
    const library = dumpLibrary(db);
    assert.deepEqual(library.playlists[0], {
      ...EXPECTED_LIBRARY.playlists[0],
      name: "Liked Songs",
    });
    assert.deepEqual(
      library.playlistSongs
        .filter((row) => row.playlistId === 2)
        .map((row) => row.songId),
      [3, 1, 5],
    );
  });
});
