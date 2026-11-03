/**
 * Every backup format the app reads restores: the real 2.5.2 backup zip, and
 * a 3.0 backup's own database. See docs/rewrite.md → Restoring a backup.
 */
import assert from "node:assert/strict";
import { existsSync, rmSync } from "node:fs";
import { dirname, join } from "node:path";
import { test } from "node:test";
import { fileURLToPath } from "node:url";
import { sql } from "drizzle-orm";

import type { LibraryDb } from "../client.ts";
import {
  findLegacyBackupRoot,
  importLegacyLibrary,
  LEGACY_DB_PATH,
} from "../legacy/index.ts";
import { dumpLibrary } from "../testing/dump-library.ts";
import {
  library,
  merge,
  playlistTitles,
  T,
  tempFolder,
  TestLibrary,
  titles,
} from "../testing/merge-fixture.ts";
import { nodeFileSystem, openLegacyDatabaseFile } from "../testing/node-fs.ts";
import { openTestLibraryDb } from "../testing/node-sqlite.ts";
import { hashTree } from "../testing/run-import.ts";
import { extractZip } from "../testing/unzip.ts";
import { isNewerLibrarySchema } from "./index.ts";

const fixture = join(
  dirname(fileURLToPath(import.meta.url)),
  "../../fixtures/legacy-2.5.2",
);

/** The real 2.5.2 backup zip, read the way the app reads it. */
async function legacyBackup(t: { after: (run: () => void) => void }) {
  const extracted = extractZip(
    join(fixture, "backup", "synq-2.5.2-backup.zip"),
  );
  t.after(() => rmSync(extracted, { force: true, recursive: true }));
  const root = await findLegacyBackupRoot(nodeFileSystem, extracted);
  if (root === null) throw new Error("No backup root");
  const { db } = await openTestLibraryDb();
  const legacy = openLegacyDatabaseFile(join(root, LEGACY_DB_PATH));
  await importLegacyLibrary({
    asyncStorage: null,
    fs: nodeFileSystem,
    legacyDb: legacy.legacyDb,
    now: T,
    root,
    source: "backup",
    targetDb: db,
  });
  legacy.close();
  return new TestLibrary(db, root);
}

/** A library's content, without ids. */
function shape(db: LibraryDb) {
  const dump = dumpLibrary(db);
  function title(id: number) {
    return dump.songs.find((s) => s.id === id)?.title;
  }
  return {
    albums: dump.albums
      .map((album) => ({
        artists: dump.albumArtists
          .filter((r) => r.albumId === album.id)
          .map((r) => dump.artists.find((a) => a.id === r.artistId)?.name),
        art: album.artworkVersion !== null,
        name: album.name,
        tracks: dump.albumSongs
          .filter((r) => r.albumId === album.id)
          .map((r) => [title(r.songId), r.track])
          .sort(),
        year: album.year,
      }))
      .sort((a, b) => a.name.localeCompare(b.name)),
    artists: dump.artists
      .map((a) => [a.name, a.artworkVersion !== null])
      .sort(),
    playlists: dump.playlists
      .map((p) => ({
        art: p.artworkVersion !== null,
        kind: p.kind,
        name: p.name,
        songs: dump.playlistSongs
          .filter((r) => r.playlistId === p.id)
          .map((r) => title(r.songId)),
      }))
      .sort((a, b) => a.name.localeCompare(b.name)),
    songs: dump.songs
      .map((s) => [
        s.title,
        s.durationMs,
        s.filePath?.split("/").at(-1),
        s.artworkVersion !== null,
        dump.songArtists
          .filter((r) => r.songId === s.id)
          .map((r) => dump.artists.find((a) => a.id === r.artistId)?.name),
      ])
      .sort(),
  };
}

void test("a 2.5.2 backup into an empty library comes through whole", async (t) => {
  const backup = await legacyBackup(t);
  const current = await library();
  const { summary } = await merge(current, backup);
  assert.equal(summary.songs, 19);
  assert.deepEqual(shape(current.db), shape(backup.db));
  assert.deepEqual(playlistTitles(current.db, "Liked Songs"), [
    "Overpass",
    "Glasshouse",
    "Café Ünïcødé",
    "Keystone",
    "東京の夜 (Tokyo Night)",
  ]);
  for (const song of dumpLibrary(current.db).songs) {
    assert.ok(song.filePath !== null, song.title);
    assert.ok(existsSync(join(current.root, song.filePath)), song.filePath);
  }
});

void test("a 2.5.2 backup into the library it came from adds nothing", async (t) => {
  const backup = await legacyBackup(t);
  const current = await library();
  await merge(current, backup);
  const dump = dumpLibrary(current.db);
  const tree = hashTree(current.root);
  const { summary } = await merge(current, backup);
  assert.equal(summary.songs, 0);
  assert.deepEqual(dumpLibrary(current.db), dump);
  assert.deepEqual(hashTree(current.root), tree);
});

void test("a 2.5.2 backup into a library with colliding ids keeps both", async (t) => {
  const backup = await legacyBackup(t);
  const current = await library();
  for (let id = 1; id <= 25; id++)
    current.song(id, `Mine ${String(id)}`, `mine ${String(id)}`);
  current.playlist(2, "Favs", [1, 2], { kind: "liked" });
  const tree = hashTree(current.root);
  await merge(current, backup);
  const dump = dumpLibrary(current.db);
  assert.equal(dump.songs.length, 25 + 19);
  assert.deepEqual(playlistTitles(current.db, "Favs"), [
    "Mine 1",
    "Mine 2",
    "Overpass",
    "Glasshouse",
    "Café Ünïcødé",
    "Keystone",
    "東京の夜 (Tokyo Night)",
  ]);
  const after = hashTree(current.root);
  for (const [path, hash] of Object.entries(tree))
    assert.equal(after[path], hash);
});

void test("a 3.0 backup's database reopens, migrates, and merges", async () => {
  const source = await library();
  source.song(1, "Theirs", "theirs");
  const folder = tempFolder();
  const path = join(folder, "library.db");
  source.db.run(sql.raw(`VACUUM INTO '${path}'`));
  const opened = await openTestLibraryDb(path);
  assert.equal(isNewerLibrarySchema(opened.db), false);
  const current = await library();
  await merge(current, new TestLibrary(opened.db, source.root));
  assert.deepEqual(titles(current.db), ["Theirs"]);

  opened.db.run(
    sql`UPDATE __drizzle_migrations SET created_at = created_at + 1`,
  );
  assert.equal(isNewerLibrarySchema(opened.db), true);
});
