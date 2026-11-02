/**
 * Restoring a backup: artists, albums, and blanks filling in. The rules are
 * in docs/rewrite.md → Restoring a backup.
 */
import assert from "node:assert/strict";
import { test } from "node:test";

import { dumpLibrary } from "../testing/dump-library.ts";
import { library, merge, MERGED_AT, read } from "../testing/merge-fixture.ts";

void test("artists and albums match by name and keep track numbers", async () => {
  const current = await library();
  current.song(1, "One", "one");
  current.artist(1, "Mira Vale");
  current.credit(1, 1);
  current.album(1, "Night Drive", { cover: "my art" });
  current.track(1, 1, 1);
  current.albumArtist(1, 1);
  const backup = await library();
  backup.song(1, "One", "one");
  backup.song(2, "Two", "two");
  backup.artist(7, "MIRA VALE", "their art");
  backup.artist(8, "Guest");
  backup.credit(1, 7);
  backup.credit(2, 7);
  backup.credit(2, 8, 1);
  backup.album(3, "night drive", { cover: "their art", year: 2019 });
  backup.track(3, 1, 1);
  backup.track(3, 2, 2);
  backup.albumArtist(3, 7);
  backup.albumArtist(3, 8, 1);

  await merge(current, backup);

  const dump = dumpLibrary(current.db);
  assert.deepEqual(
    dump.artists.map((a) => a.name),
    ["Mira Vale", "Guest"],
  );
  assert.deepEqual(
    dump.albums.map((a) => a.name),
    ["Night Drive"],
  );
  assert.equal(dump.albums[0]?.year, 2019, "a blank year fills in");
  assert.deepEqual(
    dump.albumSongs.map((r) => [r.albumId, r.songId, r.track]),
    [
      [1, 1, 1],
      [1, 2, 2],
    ],
  );
  assert.deepEqual(
    dump.albumArtists.map((r) => [r.artistId, r.position]),
    [
      [1, 0],
      [2, 1],
    ],
  );
  assert.deepEqual(
    dump.songArtists.filter((r) => r.songId === 2),
    [
      { artistId: 1, position: 0, songId: 2 },
      { artistId: 2, position: 1, songId: 2 },
    ],
  );
  assert.equal(read(current, "albums/1/cover_full.jpg"), "my art full");
  assert.equal(read(current, "artists/1/cover_full.jpg"), "their art full");
  assert.equal(
    dump.artists[0]?.artworkVersion,
    MERGED_AT,
    "a blank cover fills in",
  );
});

void test("an album that gains nothing keeps its artists", async () => {
  const current = await library();
  current.song(1, "One", "one");
  current.artist(1, "Björk");
  current.credit(1, 1);
  current.album(1, "Debut");
  current.track(1, 1, null);
  current.albumArtist(1, 1);
  const backup = await library();
  backup.song(1, "One", "one");
  backup.artist(1, "Bjork");
  backup.credit(1, 1);
  backup.album(1, "Debut");
  backup.track(1, 1, 4);
  backup.albumArtist(1, 1);
  await merge(current, backup);
  const dump = dumpLibrary(current.db);
  assert.deepEqual(
    dump.artists.map((a) => a.name),
    ["Björk"],
  );
  assert.deepEqual(
    dump.albumArtists.map((r) => r.artistId),
    [1],
  );
  assert.equal(dump.albumSongs[0]?.track, 4, "a blank track fills in");
  assert.equal(dump.songs[0]?.modifiedSinceExport, true);
});

void test("a song with no credits takes the backup's", async () => {
  const current = await library();
  current.song(1, "One", "one");
  const backup = await library();
  backup.song(1, "One", "one", { cover: "art" });
  backup.artist(1, "Mira");
  backup.credit(1, 1);
  backup.album(1, "Night");
  backup.track(1, 1, 5);
  await merge(current, backup);
  const dump = dumpLibrary(current.db);
  assert.deepEqual(
    dump.artists.map((a) => a.name),
    ["Mira"],
  );
  assert.deepEqual(
    dump.albumSongs.map((r) => r.track),
    [5],
  );
  assert.equal(dump.songs[0]?.artworkVersion, MERGED_AT);
  assert.equal(read(current, "library/1/cover_small.jpg"), "art small");
});

void test("a cover file already there is never overwritten", async () => {
  const current = await library();
  current.album(1, "Album");
  current.file("albums/1/cover_full.jpg", "stray");
  const backup = await library();
  backup.album(1, "Album", { cover: "theirs" });
  await merge(current, backup);
  assert.equal(read(current, "albums/1/cover_full.jpg"), "stray");
  assert.equal(dumpLibrary(current.db).albums[0]?.artworkVersion, null);
});
