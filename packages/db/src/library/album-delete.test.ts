import assert from "node:assert/strict";
import { beforeEach, describe, test } from "node:test";
import { sql } from "drizzle-orm";

import type { LibraryDb } from "../client.ts";
import {
  addSongsToAlbum,
  addSongsToPlaylist,
  createAlbum,
  createPlaylist,
  deleteAlbumAndSongs,
  editSong,
  getAlbum,
  getSong,
  listAlbumTracks,
  listPlaylistSongs,
  listSongs,
} from "../index.ts";
import { openMigratedLibrary } from "../testing/migrated-library.ts";
import { libraryError } from "../testing/write-test-helpers.ts";

// A library imported from the synthetic 2.5.2 install, so this is also how a
// 2.5.2 library behaves.
let db: LibraryDb;
beforeEach(async () => {
  db = await openMigratedLibrary();
});

function album(name: string) {
  return createAlbum(db, { name }).value;
}

/** A new album holding the first `count` songs of a 2.5.2 library. */
function albumWithSongs(name: string, count: number) {
  const created = album(name);
  const songIds = listSongs(db)
    .slice(0, count)
    .map((song) => song.id);
  assert.equal(songIds.length, count);
  addSongsToAlbum(db, created.id, songIds);
  return { id: created.id, songIds };
}

void describe("deleting an album and its songs", () => {
  void test("removes the album, its songs, and both sets of folders", () => {
    const before = listSongs(db).length;
    const { id, songIds } = albumWithSongs("Doomed", 2);
    const [first, second] = songIds;

    const { value } = deleteAlbumAndSongs(db, id);

    assert.equal(getAlbum(db, id), null);
    assert.equal(listSongs(db).length, before - 2);
    assert.deepEqual(
      value.ids,
      [...songIds].sort((a, b) => a - b),
    );
    assert.deepEqual(value.deletePaths, [
      ...value.ids.map((songId) => `library/${songId}`),
      `albums/${id}`,
    ]);
    assert.ok(first !== undefined && second !== undefined);
    assert.equal(getSong(db, first), null);
    assert.equal(getSong(db, second), null);
  });

  void test("takes the songs off their playlists, and the rest stay", () => {
    const { id, songIds } = albumWithSongs("Doomed", 1);
    const kept = listSongs(db).find((song) => !songIds.includes(song.id));
    assert.ok(kept);
    const playlist = createPlaylist(db, "Mix").value;
    addSongsToPlaylist(db, playlist.id, [...songIds, kept.id]);

    deleteAlbumAndSongs(db, id);

    assert.deepEqual(
      listPlaylistSongs(db, playlist.id).map((song) => song.id),
      [kept.id],
    );
  });

  void test("reports another album left empty, not the deleted one", () => {
    const { id, songIds } = albumWithSongs("Doomed", 1);
    const other = album("Other");
    const [songId] = songIds;
    assert.ok(songId !== undefined);
    editSong(db, songId, {
      albums: [{ album: { id } }, { album: { id: other.id } }],
    });

    const { value } = deleteAlbumAndSongs(db, id);

    assert.deepEqual(value.emptied, [{ id: other.id, name: "Other" }]);
    assert.equal(getAlbum(db, other.id)?.songCount, 0);
  });

  void test("deletes an album with no songs", () => {
    const empty = album("Empty");
    const before = listSongs(db).length;

    assert.deepEqual(deleteAlbumAndSongs(db, empty.id).value, {
      deletePaths: [`albums/${empty.id}`],
      emptied: [],
      ids: [],
    });
    assert.equal(listSongs(db).length, before);
  });

  void test("throws for a missing album and deletes nothing", () => {
    const before = listSongs(db).length;
    assert.throws(
      () => deleteAlbumAndSongs(db, 999_999),
      libraryError("not-found"),
    );
    assert.equal(listSongs(db).length, before);
  });

  void test("keeps the songs when the album can't be deleted", () => {
    const { id, songIds } = albumWithSongs("Doomed", 2);
    const before = listSongs(db).length;
    db.run(
      sql.raw(`CREATE TRIGGER keep_album BEFORE DELETE ON albums
        BEGIN SELECT RAISE(ABORT, 'refused'); END`),
    );

    assert.throws(() => deleteAlbumAndSongs(db, id));

    assert.equal(listSongs(db).length, before);
    assert.deepEqual(
      listAlbumTracks(db, id)
        .map((track) => track.id)
        .sort((a, b) => a - b),
      [...songIds].sort((a, b) => a - b),
    );
  });
});
