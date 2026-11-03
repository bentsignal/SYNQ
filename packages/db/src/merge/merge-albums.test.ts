/**
 * Restoring a backup: same-named albums stay apart by the rule import uses.
 * docs/rewrite.md → Same-named albums, and Restoring a backup.
 */
import assert from "node:assert/strict";
import { test } from "node:test";

import type { TestLibrary } from "../testing/merge-fixture.ts";
import { dumpLibrary } from "../testing/dump-library.ts";
import { library, merge, read } from "../testing/merge-fixture.ts";

/** Every album's name, artists, and song count, sorted. */
function albumsIn(side: TestLibrary) {
  const dump = dumpLibrary(side.db);
  const artistName = new Map(dump.artists.map((a) => [a.id, a.name]));
  return dump.albums
    .map((album) => ({
      artists: dump.albumArtists
        .filter((row) => row.albumId === album.id)
        .map((row) => artistName.get(row.artistId)),
      name: album.name,
      songs: dump.albumSongs.filter((row) => row.albumId === album.id).length,
    }))
    .sort((a, b) => String(a.artists).localeCompare(String(b.artists)));
}

void test("same-named albums by different artists stay apart", async () => {
  const current = await library();
  current.song(1, "One", "one");
  current.artist(1, "Queen");
  current.credit(1, 1);
  current.album(1, "Greatest Hits");
  current.track(1, 1, 1);
  current.albumArtist(1, 1);
  const backup = await library();
  backup.song(5, "Two", "two");
  backup.artist(5, "ABBA");
  backup.credit(5, 5);
  backup.album(5, "Greatest Hits", { cover: "theirs" });
  backup.track(5, 5, 1);
  backup.albumArtist(5, 5);
  await merge(current, backup);
  assert.deepEqual(albumsIn(current), [
    { artists: ["ABBA"], name: "Greatest Hits", songs: 1 },
    { artists: ["Queen"], name: "Greatest Hits", songs: 1 },
  ]);
  const dump = dumpLibrary(current.db);
  assert.equal(dump.albums[0]?.artworkVersion, null, "Queen's takes no cover");
  assert.equal(read(current, "albums/2/cover_full.jpg"), "theirs full");
});

void test("a backup's own two same-named albums come across as two", async () => {
  const current = await library();
  const backup = await library();
  backup.song(1, "One", "one");
  backup.song(2, "Two", "two");
  backup.artist(1, "Queen");
  backup.artist(2, "ABBA");
  backup.credit(1, 1);
  backup.credit(2, 2);
  backup.album(1, "Greatest Hits");
  backup.album(2, "Greatest Hits");
  backup.track(1, 1, 1);
  backup.track(2, 2, 1);
  backup.albumArtist(1, 1);
  backup.albumArtist(2, 2);
  await merge(current, backup);
  assert.deepEqual(albumsIn(current), [
    { artists: ["ABBA"], name: "Greatest Hits", songs: 1 },
    { artists: ["Queen"], name: "Greatest Hits", songs: 1 },
  ]);
});

void test("an album with artists in common combines, and adds the backup's others", async () => {
  const current = await library();
  current.song(1, "One", "one");
  current.artist(1, "Queen");
  current.credit(1, 1);
  current.album(1, "Duets");
  current.track(1, 1, 1);
  current.albumArtist(1, 1);
  const backup = await library();
  backup.song(2, "Two", "two");
  backup.artist(7, "QUEEN");
  backup.artist(8, "Bowie");
  backup.credit(2, 7);
  backup.album(3, "duets");
  backup.track(3, 2, 2);
  backup.albumArtist(3, 7);
  backup.albumArtist(3, 8, 1);
  await merge(current, backup);
  assert.deepEqual(albumsIn(current), [
    { artists: ["Queen", "Bowie"], name: "Duets", songs: 2 },
  ]);
});

void test("an album with no artists on one side can't be told apart: they combine", async () => {
  const current = await library();
  current.song(1, "One", "one");
  current.album(1, "Mix");
  current.track(1, 1, 1);
  const backup = await library();
  backup.song(2, "Two", "two");
  backup.artist(2, "DJ");
  backup.credit(2, 2);
  backup.album(2, "Mix");
  backup.track(2, 2, 2);
  backup.albumArtist(2, 2);
  await merge(current, backup);
  assert.deepEqual(albumsIn(current), [
    { artists: ["DJ"], name: "Mix", songs: 2 },
  ]);
});

void test("a compilation's many artists stay one album", async () => {
  const current = await library();
  const backup = await library();
  for (const id of [1, 2, 3]) {
    backup.song(id, `Song ${String(id)}`, `audio ${String(id)}`);
    backup.artist(id, `Artist ${String(id)}`);
    backup.credit(id, id);
  }
  backup.artist(9, "Various Artists");
  backup.album(1, "Now 50");
  for (const id of [1, 2, 3]) backup.track(1, id, id);
  backup.albumArtist(1, 9);
  await merge(current, backup);
  assert.deepEqual(albumsIn(current), [
    { artists: ["Various Artists"], name: "Now 50", songs: 3 },
  ]);
});

void test("a legacy album of several artists takes a same-named one sharing any", async () => {
  // As 2.5.2 left it: one row, crediting every track's artist.
  const current = await library();
  current.song(1, "One", "one");
  current.artist(1, "Queen");
  current.artist(2, "ABBA");
  current.credit(1, 1);
  current.album(1, "Greatest Hits");
  current.track(1, 1, 1);
  current.albumArtist(1, 1);
  current.albumArtist(1, 2, 1);
  const backup = await library();
  backup.song(5, "Two", "two");
  backup.artist(5, "ABBA");
  backup.credit(5, 5);
  backup.album(5, "Greatest Hits");
  backup.track(5, 5, 2);
  backup.albumArtist(5, 5);
  await merge(current, backup);
  assert.deepEqual(albumsIn(current), [
    { artists: ["Queen", "ABBA"], name: "Greatest Hits", songs: 2 },
  ]);
});

void test("restoring same-named albums twice changes nothing the second time", async () => {
  const current = await library();
  current.song(1, "One", "one");
  current.artist(1, "Queen");
  current.credit(1, 1);
  current.album(1, "Greatest Hits");
  current.track(1, 1, 1);
  current.albumArtist(1, 1);
  async function build() {
    const backup = await library();
    backup.song(5, "Two", "two");
    backup.song(6, "Three", "three");
    backup.artist(5, "ABBA");
    backup.artist(6, "Elton");
    backup.credit(5, 5);
    backup.credit(6, 6);
    backup.album(5, "Greatest Hits");
    backup.album(6, "greatest hits");
    backup.album(7, "Greatest Hits");
    backup.track(5, 5, 1);
    backup.track(6, 6, 1);
    backup.albumArtist(5, 5);
    backup.albumArtist(6, 6);
    return backup;
  }
  await merge(current, await build());
  const once = dumpLibrary(current.db);
  await merge(current, await build());
  assert.deepEqual(dumpLibrary(current.db), once);
  assert.equal(
    once.albums.filter((a) => a.name.toLowerCase() === "greatest hits").length,
    3,
  );
});
