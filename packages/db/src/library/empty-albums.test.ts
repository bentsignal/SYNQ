import assert from "node:assert/strict";
import { beforeEach, describe, test } from "node:test";

import type { LibraryDb } from "../client.ts";
import {
  addSongsToAlbum,
  createAlbum,
  deleteSongs,
  editSong,
  getAlbum,
  listEmptyAlbums,
  listSongs,
  removeSongsFromAlbum,
  setAlbumTracks,
} from "../index.ts";
import { openMigratedLibrary } from "../testing/migrated-library.ts";

// A library imported from the synthetic 2.5.2 install, so this is also how a
// 2.5.2 library behaves: its albums stay until someone confirms a delete.
let db: LibraryDb;
beforeEach(async () => {
  db = await openMigratedLibrary();
});

function songOnAlbum() {
  const song = listSongs(db).find((item) => item.albums.length === 1);
  const album = song?.albums[0];
  assert.ok(song && album);
  return { albumId: album.id, songId: song.id };
}

function newAlbum(name = "Mixtape") {
  return createAlbum(db, { name }).value;
}

void describe("albums left empty", () => {
  /** A one-song album made from a library song, as 2.5.2 singles are. */
  function single(name: string) {
    const { songId } = songOnAlbum();
    const album = newAlbum(name);
    addSongsToAlbum(db, album.id, [songId]);
    return { album, songId };
  }

  void test("moving an album's last song out names it, and keeps it", () => {
    const { album, songId } = single("Single");
    const target = newAlbum();
    const result = setAlbumTracks(db, target.id, [songId]);
    assert.deepEqual(result.value.emptied, [{ id: album.id, name: "Single" }]);
    assert.equal(getAlbum(db, album.id)?.songCount, 0);
  });

  void test("taking off an album's last song names it, and keeps it", () => {
    const { album, songId } = single("Single");
    const result = removeSongsFromAlbum(db, album.id, [songId]);
    assert.deepEqual(result.value.emptied, [{ id: album.id, name: "Single" }]);
    assert.equal(getAlbum(db, album.id)?.songCount, 0);
  });

  void test("taking off a song with others left names nothing", () => {
    const { albumId, songId } = songOnAlbum();
    const result = removeSongsFromAlbum(db, albumId, [songId]);
    assert.deepEqual(result.value.emptied, []);
  });

  void test("deleting an album's last song names it, and keeps it", () => {
    const { album, songId } = single("Single");
    const result = deleteSongs(db, [songId]);
    assert.deepEqual(result.value.emptied, [{ id: album.id, name: "Single" }]);
    assert.equal(getAlbum(db, album.id)?.songCount, 0);
  });

  void test("deleting a song with others left names nothing", () => {
    const { songId } = songOnAlbum();
    assert.deepEqual(deleteSongs(db, [songId]).value.emptied, []);
  });

  void test("an album with songs left isn't named", () => {
    const { albumId, songId } = songOnAlbum();
    assert.ok((getAlbum(db, albumId)?.songCount ?? 0) > 1);
    const target = newAlbum();
    assert.deepEqual(setAlbumTracks(db, target.id, [songId]).value.emptied, []);
  });

  void test("a song 2.5.2 put on two albums empties both", () => {
    const { album, songId } = single("Single");
    const second = newAlbum("Second");
    editSong(db, songId, {
      albums: [{ album: { id: album.id } }, { album: { id: second.id } }],
    });
    const target = newAlbum();
    const result = setAlbumTracks(db, target.id, [songId]);
    assert.deepEqual(
      result.value.emptied.map((item) => item.id).sort((a, b) => a - b),
      [album.id, second.id].sort((a, b) => a - b),
    );
  });

  void test("an older empty album is never named", () => {
    const older = newAlbum("Older");
    const { songId } = single("Single");
    const target = newAlbum();
    const { emptied } = setAlbumTracks(db, target.id, [songId]).value;
    assert.ok(!emptied.some((item) => item.id === older.id));
  });

  void test("emptying the album itself isn't reported", () => {
    const { album } = single("Single");
    assert.deepEqual(setAlbumTracks(db, album.id, []).value.emptied, []);
    assert.equal(getAlbum(db, album.id)?.songCount, 0);
  });

  void test("listEmptyAlbums keeps only the empty ones it's asked about", () => {
    const { albumId } = songOnAlbum();
    const empty = newAlbum("Empty");
    newAlbum("Also Empty");
    assert.deepEqual(listEmptyAlbums(db, [albumId, empty.id]), [
      { id: empty.id, name: "Empty" },
    ]);
    assert.deepEqual(listEmptyAlbums(db, []), []);
  });
});
