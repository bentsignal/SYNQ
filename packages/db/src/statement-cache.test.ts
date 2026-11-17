import assert from "node:assert/strict";
import { test } from "node:test";
// The driver entry: `drizzle-orm/expo-sqlite` itself imports expo-sqlite (native).
import { drizzle } from "drizzle-orm/expo-sqlite/driver";
import { migrate } from "drizzle-orm/expo-sqlite/migrator";

import type { LibraryDb } from "./client.ts";
import { listAlbums, listArtists, listPlaylists, listSongs } from "./index.ts";
import { importLegacyLibrary } from "./legacy/import-legacy-library.ts";
import { libraryMigrations } from "./migrations.ts";
import * as schema from "./schema.ts";
import { cacheStatements } from "./statement-cache.ts";
import {
  IMPORTED_AT,
  openMigratedLibrary,
} from "./testing/migrated-library.ts";
import { nodeFileSystem, openLegacyDatabaseFile } from "./testing/node-fs.ts";
import { NodeExpoDatabase } from "./testing/node-sqlite.ts";
import { buildSyntheticInstall } from "./testing/synthetic-install.ts";

class FakeStatement {
  finalized = false;
  finalizeSync() {
    if (this.finalized) throw new Error("finalized twice");
    this.finalized = true;
  }
}

function fakeClient() {
  const prepared = new Array<FakeStatement>();
  return {
    prepared,
    prepareSync(_source: string) {
      const statement = new FakeStatement();
      prepared.push(statement);
      return statement;
    },
  };
}

void test("the same SQL reuses its statement", () => {
  const client = fakeClient();
  const cache = cacheStatements(client, 4);
  const first = cache.prepareSync("select 1");
  assert.equal(cache.prepareSync("select 1"), first);
  assert.equal(client.prepared.length, 1);
});

void test("past the size, the least recently used statement is finalized", () => {
  const cache = cacheStatements(fakeClient(), 2);
  const a = cache.prepareSync("a");
  const b = cache.prepareSync("b");
  cache.prepareSync("a"); // a is now the most recent
  cache.prepareSync("c");
  assert.equal(b.finalized, true);
  assert.equal(a.finalized, false);
  assert.equal(cache.prepareSync("a"), a);
  // b is prepared again, fresh.
  assert.notEqual(cache.prepareSync("b"), b);
});

void test("a finalize that reports the statement's last error is ignored", () => {
  const cache = cacheStatements(fakeClient(), 1);
  const failing = cache.prepareSync("insert");
  failing.finalizeSync = () => {
    throw new Error("UNIQUE constraint failed");
  };
  assert.doesNotThrow(() => cache.prepareSync("select"));
});

void test("the connection's own statements aren't the cache's", () => {
  const client = fakeClient();
  const cache = cacheStatements(client, 4);
  const cached = cache.prepareSync("select 1");
  // A helper such as `runSync` prepares on the connection and finalizes.
  client.prepareSync("select 1").finalizeSync();
  assert.equal(cached.finalized, false);
  assert.equal(cache.prepareSync("select 1"), cached);
});

function readEverything(db: LibraryDb) {
  return {
    albums: listAlbums(db),
    artists: listArtists(db),
    playlists: listPlaylists(db),
    songs: listSongs(db, { sort: "title", order: "asc" }),
  };
}

void test("a library imports and reads the same through a few reused statements", async () => {
  const expected = readEverything(await openMigratedLibrary());

  const install = buildSyntheticInstall();
  const client = new NodeExpoDatabase();
  client.execSync("PRAGMA foreign_keys = ON;");
  // Small enough that the import both reuses and evicts statements.
  // eslint-disable-next-line @typescript-eslint/consistent-type-assertions -- the driver's types want expo-sqlite's class; the cache has what it calls
  const db = drizzle(cacheStatements(client, 3) as never, { schema });
  await migrate(db, libraryMigrations);
  const legacy = openLegacyDatabaseFile(install.dbPath);
  try {
    await importLegacyLibrary({
      fs: nodeFileSystem,
      legacyDb: legacy.legacyDb,
      now: IMPORTED_AT,
      root: install.documents,
      source: "install",
      targetDb: db,
    });
  } finally {
    legacy.close();
  }
  assert.deepEqual(readEverything(db), expected);
  // And again, now from the cache.
  assert.deepEqual(readEverything(db), expected);
});
