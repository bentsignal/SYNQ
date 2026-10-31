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
import { existsSync, rmSync } from "node:fs";
import { dirname, join } from "node:path";
import { describe, test } from "node:test";
import { fileURLToPath } from "node:url";

import type { LibraryDb } from "../client.ts";
import { dumpLibrary } from "../testing/dump-library.ts";
import { nodeFileSystem, openLegacyDatabaseFile } from "../testing/node-fs.ts";
import { openTestLibraryDb } from "../testing/node-sqlite.ts";
import {
  assertExactLibrary,
  EXPECTED_COUNTS,
  EXPECTED_SETTINGS,
  EXPECTED_WARNINGS,
} from "../testing/real-fixture-assert.ts";
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
