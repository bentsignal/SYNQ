import assert from "node:assert/strict";
import { describe, test } from "node:test";
import { sql } from "drizzle-orm";

import type { LegacyImportWarning } from "./index.ts";
import { addSongs } from "../library/song-writes.ts";
import { dumpLibrary } from "../testing/dump-library.ts";
import {
  EXPECTED_LIBRARY,
  EXPECTED_SETTINGS,
} from "../testing/expected-import.ts";
import { openTestLibraryDb } from "../testing/node-sqlite.ts";
import { hashTree, NOW, runImport } from "../testing/run-import.ts";
import { buildSyntheticInstall } from "../testing/synthetic-install.ts";
import { getLegacyImport } from "./index.ts";

function idsOf(warnings: readonly LegacyImportWarning[], code: string) {
  return warnings.find((w) => w.code === code)?.ids;
}

function messageOf(warnings: readonly LegacyImportWarning[], code: string) {
  return warnings.find((w) => w.code === code)?.message ?? "";
}

void describe("importLegacyLibrary (synthetic 2.5.2 install)", () => {
  void test("migrates the whole library exactly", async () => {
    const install = buildSyntheticInstall();
    const { db, result } = await runImport(install);
    assert.equal(result.status, "imported");
    assert.deepEqual(dumpLibrary(db), EXPECTED_LIBRARY);
    assert.deepEqual(result.counts, {
      songs: 13,
      artists: 7,
      albums: 6,
      playlists: 3,
      songArtists: 7,
      albumSongs: 5,
      albumArtists: 6,
      playlistSongs: 9,
    });
  });

  void test("returns the settings and playback session from AsyncStorage", async () => {
    const { db, result } = await runImport(buildSyntheticInstall());
    assert.equal(result.status, "imported");
    assert.deepEqual(result.settings, EXPECTED_SETTINGS);
    // Also stored, so the app can re-apply them after a crash between commit and kv-store write.
    assert.deepEqual(getLegacyImport(db)?.settings, EXPECTED_SETTINGS);
  });

  void test("reports every edge case it handled", async () => {
    const { result } = await runImport(buildSyntheticInstall());
    assert.equal(result.status, "imported");
    const { warnings } = result;
    assert.deepEqual(warnings.map((w) => w.code).sort(), [
      "audio-file-missing",
      "audio-file-recovered",
      "duplicate-join-rows",
      "hidden-song-imported",
      "hidden-song-skipped",
      "orphan-folders",
      "orphan-join-rows",
      "packed-track-number",
      "partial-artwork",
      "song-albums-collapsed",
      "title-from-file-name",
    ]);
    assert.deepEqual(idsOf(warnings, "audio-file-missing"), [7]);
    assert.deepEqual(idsOf(warnings, "audio-file-recovered"), [8]);
    assert.deepEqual(idsOf(warnings, "hidden-song-skipped"), [9]);
    assert.deepEqual(idsOf(warnings, "hidden-song-imported"), [10]);
    assert.deepEqual(idsOf(warnings, "title-from-file-name"), [14, 15]);
    assert.deepEqual(idsOf(warnings, "packed-track-number"), [16]);
    assert.deepEqual(idsOf(warnings, "song-albums-collapsed"), [2]);
    assert.match(
      messageOf(warnings, "orphan-join-rows"),
      /artistSongs 2, albumSongs 1, artistsAlbums 1, playlistSongs 2/,
    );
    assert.match(
      messageOf(warnings, "duplicate-join-rows"),
      /artistSongs 1, albumSongs 1, artistsAlbums 1, playlistSongs 1/,
    );
    assert.match(
      messageOf(warnings, "orphan-folders"),
      /albums\/77, library\/11/,
    );
    assert.match(messageOf(warnings, "partial-artwork"), /album 4/);
  });
});

void describe("importLegacyLibrary (guarantees)", () => {
  void test("carries sqlite_sequence over so 2.5.2 ids are never reissued", async () => {
    const { db } = await runImport(buildSyntheticInstall());
    const sequences = Object.fromEntries(
      db
        .all<{
          name: string;
          seq: number;
        }>(sql`SELECT name, seq FROM sqlite_sequence`)
        .map((r) => [r.name, r.seq]),
    );
    // Song 16 was the last 2.5.2 import; playlist 5 the last playlist; playlistSongs reached 26.
    assert.equal(sequences.songs, 16);
    assert.equal(sequences.playlists, 5);
    assert.equal(sequences.playlist_songs, 26);
    const added = addSongs(
      db,
      [{ title: "New", fileName: "new.mp3", durationMs: 1 }],
      { now: NOW },
    );
    assert.equal(added.value[0]?.id, 17);
  });

  void test("never modifies legacy files", async () => {
    const install = buildSyntheticInstall();
    const before = hashTree(install.container);
    await runImport(install);
    assert.deepEqual(hashTree(install.container), before);
  });

  void test("is idempotent", async () => {
    const install = buildSyntheticInstall();
    const first = await runImport(install);
    assert.equal(first.result.status, "imported");
    const snapshot = dumpLibrary(first.db);
    const second = await runImport(install, {
      targetDb: first.db,
      now: NOW + 5_000,
    });
    assert.deepEqual(second.result, {
      status: "already-imported",
      importId: first.result.importId,
      importedAt: NOW,
      settings: EXPECTED_SETTINGS,
    });
    assert.deepEqual(dumpLibrary(first.db), snapshot);
  });

  void test("rolls back everything when the import fails midway, and the retry succeeds", async () => {
    const install = buildSyntheticInstall();
    const { db } = await openTestLibraryDb();
    const empty = dumpLibrary(db);
    await assert.rejects(
      runImport(install, {
        targetDb: db,
        onProgress: (step) => {
          if (step === "verifying")
            throw new Error("simulated crash after writing every table");
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
});
