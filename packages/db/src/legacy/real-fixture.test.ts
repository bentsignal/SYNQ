/**
 * Imports the real 2.5.2 container captured from the simulator (see the
 * fixture's EXPECTED.md) when it's available; skipped otherwise. Point
 * `SYNQ_LEGACY_FIXTURE` at another capture to run it elsewhere.
 *
 * Expected layout: `<fixture>/container/` is the app's data container
 * (`Documents/`, `Library/Application Support/<bundle id>/...`), and
 * `<fixture>/expected.json` (optional) holds `{ counts, settings }` to
 * compare exactly. Without it, the test checks invariants that hold for any
 * real library.
 */
import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { test } from "node:test";
import { sql } from "drizzle-orm";

import { dumpLibrary } from "../testing/dump-library.ts";
import { nodeFileSystem, openLegacyDatabaseFile } from "../testing/node-fs.ts";
import { openTestLibraryDb } from "../testing/node-sqlite.ts";
import { BUNDLE_ID } from "../testing/synthetic-install.ts";
import {
  importLegacyLibrary,
  LEGACY_DB_PATH,
  readLegacyAsyncStorage,
} from "./index.ts";

function fixtureRoot(override: unknown) {
  return typeof override === "string"
    ? override
    : "/Users/shawn/dev/worktrees/synq-legacy-fixture";
}

/** `{ counts, settings }` from `expected.json`; either may be absent. */
function readExpected(value: unknown) {
  return typeof value === "object" && value !== null
    ? {
        counts: "counts" in value ? value.counts : undefined,
        settings: "settings" in value ? value.settings : undefined,
      }
    : { counts: undefined, settings: undefined };
}

// eslint-disable-next-line turbo/no-undeclared-env-vars -- an opt-in local path to a captured real install; it must not become part of turbo's cache key
const fixture = fixtureRoot(process.env.SYNQ_LEGACY_FIXTURE);
const container = join(fixture, "container");
const documents = join(container, "Documents");
const available = existsSync(join(documents, LEGACY_DB_PATH));

void test(
  "imports the real 2.5.2 fixture",
  { skip: !available && `no fixture at ${documents}` },
  async () => {
    const { db } = await openTestLibraryDb();
    const legacy = openLegacyDatabaseFile(join(documents, LEGACY_DB_PATH));
    const asyncStorage = await readLegacyAsyncStorage(
      join(
        container,
        "Library",
        "Application Support",
        BUNDLE_ID,
        "RCTAsyncLocalStorage_V1",
      ),
      nodeFileSystem,
    );
    const result = await importLegacyLibrary({
      legacyDb: legacy.legacyDb,
      targetDb: db,
      fs: nodeFileSystem,
      root: documents,
      source: "install",
      asyncStorage,
    });
    assert.equal(result.status, "imported");

    const library = dumpLibrary(db);
    assert.deepEqual(db.all(sql`PRAGMA foreign_key_check`), []);
    assert.equal(library.playlists.filter((p) => p.kind === "liked").length, 1);
    for (const song of library.songs) {
      assert.ok(
        song.filePath === null ||
          existsSync(join(documents, song.filePath)) ||
          result.warnings.some((w) => w.ids?.includes(song.id)),
        `song ${song.id} file`,
      );
    }

    const expectedPath = join(fixture, "expected.json");
    if (existsSync(expectedPath)) {
      const expected = readExpected(
        JSON.parse(readFileSync(expectedPath, "utf8")),
      );
      if (expected.counts) assert.deepEqual(result.counts, expected.counts);
      if (expected.settings)
        assert.deepEqual(result.settings, expected.settings);
    }
    legacy.close();
  },
);
