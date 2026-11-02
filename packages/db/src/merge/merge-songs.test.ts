/**
 * Restoring a backup, on real files: which songs are the same, and what a
 * new one gets. The rules are in docs/rewrite.md → Restoring a backup.
 */
import assert from "node:assert/strict";
import { test } from "node:test";
import { sql } from "drizzle-orm";

import { dumpLibrary } from "../testing/dump-library.ts";
import { library, merge, read, titles } from "../testing/merge-fixture.ts";
import { hashTree } from "../testing/run-import.ts";

void test("ids that collide are different songs, with their own files", async () => {
  const current = await library();
  current.song(1, "Mine", "my audio", { cover: "my cover" });
  current.album(1, "My Album", { cover: "my album" });
  current.track(1, 1, 1);
  const backup = await library();
  backup.song(1, "Theirs", "their audio", { cover: "their cover" });
  backup.album(1, "Their Album", { cover: "their album" });
  backup.track(1, 1, 7);

  const before = hashTree(current.root);
  const { summary } = await merge(current, backup);

  assert.deepEqual(summary, {
    albums: 1,
    artists: 0,
    filled: 0,
    playlists: 0,
    playlistsExtended: 0,
    songs: 1,
  });
  const dump = dumpLibrary(current.db);
  assert.deepEqual(
    dump.songs.map((s) => [s.id, s.title, s.filePath]),
    [
      [1, "Mine", "library/1/Mine.mp3"],
      [2, "Theirs", "library/2/Theirs.mp3"],
    ],
  );
  assert.deepEqual(dump.albumSongs, [
    { albumId: 1, position: 0, songId: 1, track: 1 },
    { albumId: 2, position: 0, songId: 2, track: 7 },
  ]);
  assert.equal(read(current, "library/2/Theirs.mp3"), "their audio");
  assert.equal(read(current, "library/2/cover_full.jpg"), "their cover full");
  assert.equal(read(current, "albums/2/cover_small.jpg"), "their album small");
  const after = hashTree(current.root);
  for (const [path, hash] of Object.entries(before)) {
    assert.equal(after[path], hash, `${path} is untouched`);
  }
});

void test("the same file is the same song, and the current library wins", async () => {
  const current = await library();
  current.song(5, "My Edited Title", "same audio", { name: "a.mp3" });
  current.artist(1, "Edited Artist");
  current.credit(5, 1);
  current.album(1, "Edited Album");
  current.track(1, 5, 3);
  const backup = await library();
  backup.song(9, "Original Title", "same audio", { name: "b.mp3" });
  backup.artist(4, "Original Artist");
  backup.credit(9, 4);
  backup.album(4, "Original Album");
  backup.track(4, 9, 8);

  const before = dumpLibrary(current.db);
  const trees = hashTree(current.root);
  const { journal, summary } = await merge(current, backup);

  assert.deepEqual(dumpLibrary(current.db), before);
  assert.deepEqual(hashTree(current.root), trees);
  assert.equal(summary.songs + summary.artists + summary.albums, 0);
  assert.equal(journal.writes, 0, "nothing to do, so nothing to undo");
});

void test("same-sized files with different bytes are different songs", async () => {
  const current = await library();
  current.song(1, "Same Title", "aaaa");
  const backup = await library();
  backup.song(1, "Same Title", "bbbb");
  await merge(current, backup);
  assert.deepEqual(titles(current.db), ["Same Title", "Same Title"]);
});

void test("restoring twice changes nothing the second time", async () => {
  const current = await library();
  current.song(1, "Mine", "my audio");
  current.playlist(1, "Liked Songs", [1], { kind: "liked" });
  const backup = await library();
  backup.song(1, "Theirs", "their audio", { cover: "cover" });
  backup.song(2, "Twin A", "twin audio");
  backup.song(3, "Twin B", "twin audio");
  backup.song(4, "Gone", null);
  backup.artist(1, "BTS", "bts art");
  backup.artist(2, "bts");
  backup.artist(3, "Nobody's Songs");
  backup.credit(1, 1);
  backup.credit(2, 2);
  backup.album(1, "Album", { cover: "art", year: 2020 });
  backup.album(2, "Empty Album");
  backup.track(1, 1, 2);
  backup.albumArtist(1, 1);
  backup.playlist(1, "Faves", [1], { kind: "liked" });
  backup.playlist(2, "Mix", [2, 3, 4], { cover: "mix" });
  backup.playlist(3, "Empty", []);

  const first = await merge(current, backup);
  assert.equal(first.summary.songs, 4);
  assert.deepEqual(
    dumpLibrary(current.db).artists.map((a) => a.name),
    ["BTS", "bts", "Nobody's Songs"],
  );
  const dump = dumpLibrary(current.db);
  const tree = hashTree(current.root);

  const second = await merge(current, backup);
  assert.deepEqual(second.summary, {
    albums: 0,
    artists: 0,
    filled: 0,
    playlists: 0,
    playlistsExtended: 0,
    songs: 0,
  });
  assert.equal(second.journal.writes, 0);
  assert.deepEqual(dumpLibrary(current.db), dump);
  assert.deepEqual(hashTree(current.root), tree);
});

void test("the same file twice under two titles keeps both, and pairs by title", async () => {
  const current = await library();
  current.song(1, "Twin B", "twin");
  const backup = await library();
  backup.song(1, "Twin A", "twin");
  backup.song(2, "Twin B", "twin");
  await merge(current, backup);
  assert.deepEqual(titles(current.db), ["Twin B", "Twin A"]);
});

void test("a song with no file matches on its title, duration, and artist", async () => {
  const current = await library();
  current.song(3, "Lost Here", null, { durationMs: 120_400 });
  current.artist(1, "Mira");
  current.credit(3, 1);
  current.song(4, "Lost There", "still here", { durationMs: 200_000 });
  const backup = await library();
  // 2.5.2 floored durations to whole seconds.
  backup.song(1, "lost here", "recovered", { durationMs: 120_000 });
  backup.artist(1, "Mira");
  backup.credit(1, 1);
  backup.song(2, "Lost There", null, { durationMs: 200_000 });
  backup.song(5, "Different", null, { durationMs: 1000 });
  const { summary } = await merge(current, backup);
  const dump = dumpLibrary(current.db);
  assert.deepEqual(
    dump.songs.map((s) => [s.id, s.title, s.filePath]),
    [
      [3, "Lost Here", "library/3/lost here.mp3"],
      [4, "Lost There", "library/4/Lost There.mp3"],
      [5, "Different", null],
    ],
  );
  assert.equal(read(current, "library/3/lost here.mp3"), "recovered");
  assert.equal(summary.songs, 1);
  assert.equal(summary.filled, 1);
});

void test("a path that leaves the library is not followed", async () => {
  const current = await library();
  const backup = await library();
  backup.file("secret.mp3", "outside");
  backup.db.run(
    sql`INSERT INTO songs (id, title, file_path, added_at) VALUES (1, 'Sneaky', 'library/../../secret.mp3', 1)`,
  );
  await merge(current, backup);
  assert.equal(dumpLibrary(current.db).songs[0]?.filePath, null);
  assert.deepEqual(hashTree(current.root), {});
});

void test("ids never land on a leftover folder or a used id", async () => {
  const current = await library();
  current.song(1, "A", "a");
  current.db.run(sql`DELETE FROM songs`);
  current.file("library/2/stray.mp3", "stray");
  const backup = await library();
  backup.song(1, "B", "b");
  await merge(current, backup);
  assert.deepEqual(
    dumpLibrary(current.db).songs.map((s) => s.id),
    [3],
  );
  assert.equal(read(current, "library/2/stray.mp3"), "stray");
});

void test("a stored name in another Unicode form still finds its file", async () => {
  const current = await library();
  const backup = await library();
  backup.file("library/1/Café.mp3".normalize("NFD"), "audio");
  backup.db.run(
    sql`INSERT INTO songs (id, title, file_path, added_at) VALUES (1, 'Café', ${"library/1/Café.mp3".normalize("NFC")}, 1)`,
  );
  await merge(current, backup);
  const stored = dumpLibrary(current.db).songs[0]?.filePath;
  assert.equal(stored, "library/1/Café.mp3".normalize("NFC"));
  assert.equal(read(current, "library/1/Café.mp3"), "audio");
});
