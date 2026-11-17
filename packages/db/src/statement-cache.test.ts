import assert from "node:assert/strict";
import { test } from "node:test";

import type { LibraryDb } from "./client.ts";
import { listAlbums, listArtists, listPlaylists, listSongs } from "./index.ts";
import { importLegacyLibrary } from "./legacy/import-legacy-library.ts";
import { cacheStatements } from "./statement-cache.ts";
import {
  IMPORTED_AT,
  openMigratedLibrary,
} from "./testing/migrated-library.ts";
import { nodeFileSystem, openLegacyDatabaseFile } from "./testing/node-fs.ts";
import { openTestLibraryDb } from "./testing/node-sqlite.ts";
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
  cacheStatements(client, 4);
  const first = client.prepareSync("select 1");
  assert.equal(client.prepareSync("select 1"), first);
  assert.equal(client.prepared.length, 1);
});

void test("past the size, the least recently used statement is finalized", () => {
  const client = fakeClient();
  cacheStatements(client, 2);
  const a = client.prepareSync("a");
  const b = client.prepareSync("b");
  client.prepareSync("a"); // a is now the most recent
  client.prepareSync("c");
  assert.equal(b.finalized, true);
  assert.equal(a.finalized, false);
  assert.equal(client.prepareSync("a"), a);
  // b is prepared again, fresh.
  assert.notEqual(client.prepareSync("b"), b);
});

void test("a finalize that reports the statement's last error is ignored", () => {
  const client = fakeClient();
  cacheStatements(client, 1);
  const failing = client.prepareSync("insert");
  failing.finalizeSync = () => {
    throw new Error("UNIQUE constraint failed");
  };
  assert.doesNotThrow(() => client.prepareSync("select"));
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
  const { client, db } = await openTestLibraryDb();
  // Small enough that the import both reuses and evicts statements.
  cacheStatements(client, 3);
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
