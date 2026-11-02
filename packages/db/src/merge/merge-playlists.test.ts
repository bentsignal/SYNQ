/**
 * Restoring a backup: playlists, Liked Songs, and what stays out of it. The
 * rules are in docs/rewrite.md → Restoring a backup.
 */
import assert from "node:assert/strict";
import { test } from "node:test";
import { sql } from "drizzle-orm";

import { dumpLibrary } from "../testing/dump-library.ts";
import {
  library,
  merge,
  MERGED_AT,
  playlistTitles,
  read,
  T,
} from "../testing/merge-fixture.ts";

void test("a same-named playlist keeps its order and appends in backup order", async () => {
  const current = await library();
  current.song(1, "A", "a");
  current.song(2, "B", "b");
  current.playlist(1, "Road Trip", [2, 1]);
  const backup = await library();
  backup.song(1, "C", "c");
  backup.song(2, "B", "b");
  backup.song(3, "D", "d");
  backup.playlist(9, "road trip", [3, 2, 1]);
  backup.playlist(10, "New One", [1, 3], { cover: "new" });
  const { summary } = await merge(current, backup);
  assert.deepEqual(playlistTitles(current.db, "Road Trip"), [
    "B",
    "A",
    "D",
    "C",
  ]);
  assert.deepEqual(playlistTitles(current.db, "New One"), ["C", "D"]);
  assert.equal(summary.playlists, 1);
  assert.equal(summary.playlistsExtended, 1);
  const dump = dumpLibrary(current.db);
  assert.equal(
    dump.playlists.find((p) => p.name === "Road Trip")?.updatedAt,
    MERGED_AT,
  );
  const added = dump.playlists.find((p) => p.name === "New One");
  if (added === undefined) throw new Error("No playlist New One");
  assert.equal(added.artworkVersion, T);
  assert.equal(
    read(current, `playlists/${String(added.id)}/cover_full.jpg`),
    "new full",
  );
});

void test("Liked Songs is the union, whatever each side calls it", async () => {
  const current = await library();
  current.song(1, "A", "a");
  current.song(2, "B", "b");
  current.playlist(2, "Favs ♥", [1, 2], { kind: "liked" });
  current.playlist(3, "Bangers", []);
  const backup = await library();
  backup.song(1, "B", "b");
  backup.song(2, "C", "c");
  backup.playlist(2, "Bangers", [2], { kind: "liked" });
  await merge(current, backup);
  const dump = dumpLibrary(current.db);
  assert.deepEqual(
    dump.playlists.map((p) => [p.name, p.kind]),
    [
      ["Favs ♥", "liked"],
      ["Bangers", "user"],
    ],
  );
  assert.deepEqual(playlistTitles(current.db, "Favs ♥"), ["A", "B", "C"]);
  assert.deepEqual(playlistTitles(current.db, "Bangers"), []);
});

void test("keeps the current library's import record and adds no other", async () => {
  const current = await library();
  const backup = await library();
  backup.db.run(
    sql`INSERT INTO legacy_import (source, imported_at, counts, warnings) VALUES ('install', 1, '{}', '[]')`,
  );
  await merge(current, backup);
  assert.deepEqual(current.db.all(sql`SELECT * FROM legacy_import`), []);
});
