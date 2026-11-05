import assert from "node:assert/strict";
import { beforeEach, describe, test } from "node:test";

import type { LibraryDb } from "../client.ts";
import {
  addSongsToAlbum,
  addSongsToPlaylist,
  createAlbum,
  createArtist,
  createPlaylist,
  editSong,
  getAlbum,
  getSong,
  listAlbumTracks,
  listPlaylistSongs,
  listSongs,
  markSongsExported,
  removeSongsFromAlbum,
  setAlbumTracks,
  setPlaylistSongs,
  setTrackNumber,
} from "../index.ts";
import { openMigratedLibrary } from "../testing/migrated-library.ts";
import { ids, libraryError } from "../testing/write-test-helpers.ts";

// A library imported from the synthetic 2.5.2 install, so each test is also
// how a 2.5.2 library behaves once it has upgraded: no schema change, and
// these writes run on the rows the importer made.
let db: LibraryDb;
beforeEach(async () => {
  db = await openMigratedLibrary();
});

/** Songs that are on an album, and the album. */
function songOnAlbum(except: readonly number[] = []) {
  const song = listSongs(db).find(
    (item) =>
      item.albums.length === 1 && !except.includes(item.albums[0]?.id ?? 0),
  );
  const album = song?.albums[0];
  assert.ok(song && album);
  return { albumId: album.id, songId: song.id };
}

function newAlbum(name = "Mixtape") {
  return createAlbum(db, { name }).value;
}

function tracksOf(albumId: number) {
  return listAlbumTracks(db, albumId).map((song) => [song.id, song.track]);
}

void describe("adding songs to an album", () => {
  void test("moves a song out of its old album, keeping the old album", () => {
    const { albumId, songId } = songOnAlbum();
    const before = getAlbum(db, albumId);
    const target = newAlbum();
    const result = addSongsToAlbum(db, target.id, [songId]);
    assert.deepEqual(result.value.added, [songId]);
    assert.deepEqual(result.value.skipped, []);
    assert.ok(result.changed.includes("album_songs"));
    assert.deepEqual(
      getSong(db, songId)?.albums.map((album) => album.id),
      [target.id],
    );
    assert.ok(!ids(listAlbumTracks(db, albumId)).includes(songId));
    const after = getAlbum(db, albumId);
    assert.ok(before && after);
    assert.equal(after.songCount, before.songCount - 1);
    assert.deepEqual(after.artwork, before.artwork);
  });

  void test("takes a song 2.5.2 put on two albums off both", () => {
    const { albumId, songId } = songOnAlbum();
    const second = newAlbum("Second");
    editSong(db, songId, {
      albums: [{ album: { id: albumId } }, { album: { id: second.id } }],
    });
    const target = newAlbum();
    addSongsToAlbum(db, target.id, [songId]);
    assert.deepEqual(
      getSong(db, songId)?.albums.map((album) => album.id),
      [target.id],
    );
    assert.equal(getAlbum(db, second.id)?.songCount, 0);
  });
});

void describe("track numbers when adding songs to an album", () => {
  void test("new tracks land at the end, in the given order", () => {
    const target = newAlbum();
    const [a, b, c] = listSongs(db).map((song) => song.id);
    assert.ok(a && b && c);
    addSongsToAlbum(db, target.id, [b, a]);
    assert.deepEqual(tracksOf(target.id), [
      [b, 1],
      [a, 2],
    ]);
    addSongsToAlbum(db, target.id, [c]);
    assert.deepEqual(tracksOf(target.id), [
      [b, 1],
      [a, 2],
      [c, 3],
    ]);
  });

  void test("keeps gaps in an album's numbers and continues from the last", () => {
    const target = newAlbum();
    const [a, b, c] = listSongs(db).map((song) => song.id);
    assert.ok(a && b && c);
    addSongsToAlbum(db, target.id, [a, b]);
    setTrackNumber(db, target.id, a, 3);
    setTrackNumber(db, target.id, b, 7);
    addSongsToAlbum(db, target.id, [c]);
    assert.deepEqual(tracksOf(target.id), [
      [a, 3],
      [b, 7],
      [c, 8],
    ]);
  });

  void test("numbers unnumbered tracks first, or new ones would sort before them", () => {
    const target = newAlbum();
    const [a, b, c] = listSongs(db).map((song) => song.id);
    assert.ok(a && b && c);
    addSongsToAlbum(db, target.id, [a, b]);
    setTrackNumber(db, target.id, a, null);
    setTrackNumber(db, target.id, b, null);
    const order = ids(listAlbumTracks(db, target.id));
    addSongsToAlbum(db, target.id, [c]);
    assert.deepEqual(ids(listAlbumTracks(db, target.id)), [...order, c]);
    assert.deepEqual(
      listAlbumTracks(db, target.id).map((song) => song.track),
      [1, 2, 3],
    );
  });
});

void describe("what else adding songs to an album does", () => {
  void test("leaves songs already on the album where they are", () => {
    const target = newAlbum();
    const [a, b] = listSongs(db).map((song) => song.id);
    assert.ok(a && b);
    addSongsToAlbum(db, target.id, [a]);
    const result = addSongsToAlbum(db, target.id, [a, b, 999_999]);
    assert.deepEqual(result.value, {
      added: [b],
      emptied: [],
      skipped: [a, 999_999],
    });
    assert.deepEqual(tracksOf(target.id), [
      [a, 1],
      [b, 2],
    ]);
  });

  void test("credits the songs' artists only when the album has none", () => {
    const song = listSongs(db).find((item) => item.artists.length > 0);
    assert.ok(song);
    const empty = newAlbum();
    addSongsToAlbum(db, empty.id, [song.id]);
    assert.deepEqual(
      getAlbum(db, empty.id)?.artists.map((artist) => artist.id),
      song.artists.map((artist) => artist.id),
    );

    const artist = createArtist(db, "Someone Else").value;
    const credited = createAlbum(db, {
      artistIds: [artist.id],
      name: "Credited",
    }).value;
    addSongsToAlbum(db, credited.id, [song.id]);
    assert.deepEqual(
      getAlbum(db, credited.id)?.artists.map((credit) => credit.id),
      [artist.id],
    );
  });

  void test("marks moved songs modified, since their tags are stale", () => {
    const { songId } = songOnAlbum();
    markSongsExported(db, [songId]);
    addSongsToAlbum(db, newAlbum().id, [songId]);
    assert.equal(getSong(db, songId)?.modifiedSinceExport, true);
  });

  void test("refuses an album that doesn't exist, changing nothing", () => {
    const { albumId, songId } = songOnAlbum();
    assert.throws(
      () => addSongsToAlbum(db, 999_999, [songId]),
      libraryError("not-found"),
    );
    assert.deepEqual(
      getSong(db, songId)?.albums.map((album) => album.id),
      [albumId],
    );
  });

  void test("adding nothing changes nothing", () => {
    const result = addSongsToAlbum(db, newAlbum().id, []);
    assert.deepEqual(result.changed, []);
  });
});

void describe("removing songs from an album", () => {
  void test("takes them off, keeps them in the library, keeps other numbers", () => {
    const target = newAlbum();
    const [a, b, c] = listSongs(db).map((song) => song.id);
    assert.ok(a && b && c);
    addSongsToAlbum(db, target.id, [a, b, c]);
    markSongsExported(db, [b]);
    const result = removeSongsFromAlbum(db, target.id, [b]);
    assert.deepEqual(result.value, { emptied: [], removed: 1 });
    assert.deepEqual(tracksOf(target.id), [
      [a, 1],
      [c, 3],
    ]);
    const song = getSong(db, b);
    assert.ok(song);
    assert.equal(song.modifiedSinceExport, true);
  });

  void test("removing a song that isn't there reports nothing changed", () => {
    const target = newAlbum();
    assert.deepEqual(removeSongsFromAlbum(db, target.id, [1]).changed, []);
  });
});

void describe("saving an edit sheet's songs", () => {
  void test("an album takes the sheet's songs, in the sheet's order", () => {
    const target = newAlbum();
    const [a, b, c, d] = listSongs(db).map((song) => song.id);
    assert.ok(a && b && c && d);
    addSongsToAlbum(db, target.id, [a, b, c]);
    setAlbumTracks(db, target.id, [c, a, d]);
    assert.deepEqual(tracksOf(target.id), [
      [c, 1],
      [a, 2],
      [d, 3],
    ]);
    assert.ok(!getSong(db, b)?.albums.some((album) => album.id === target.id));
  });

  void test("leaves an album's numbers alone when the order didn't change", () => {
    const target = newAlbum();
    const [a, b, c, d] = listSongs(db).map((song) => song.id);
    assert.ok(a && b && c && d);
    addSongsToAlbum(db, target.id, [a, b]);
    setTrackNumber(db, target.id, a, 3);
    setTrackNumber(db, target.id, b, 7);
    setAlbumTracks(db, target.id, [a, b]);
    assert.deepEqual(tracksOf(target.id), [
      [a, 3],
      [b, 7],
    ]);
    setAlbumTracks(db, target.id, [a, b, c]);
    assert.deepEqual(tracksOf(target.id), [
      [a, 3],
      [b, 7],
      [c, 8],
    ]);
    setAlbumTracks(db, target.id, [b, c]);
    assert.deepEqual(tracksOf(target.id), [
      [b, 7],
      [c, 8],
    ]);
  });

  void test("a playlist takes the sheet's songs, in the sheet's order", () => {
    const playlist = createPlaylist(db, "Sheet").value;
    const [a, b, c, d] = listSongs(db).map((song) => song.id);
    assert.ok(a && b && c && d);
    addSongsToPlaylist(db, playlist.id, [a, b, c]);
    setPlaylistSongs(db, playlist.id, [d, c, a]);
    assert.deepEqual(ids(listPlaylistSongs(db, playlist.id)), [d, c, a]);
  });

  void test("a playlist can be emptied", () => {
    const playlist = createPlaylist(db, "Empty Me").value;
    const [a] = listSongs(db).map((song) => song.id);
    assert.ok(a);
    addSongsToPlaylist(db, playlist.id, [a]);
    setPlaylistSongs(db, playlist.id, []);
    assert.deepEqual(listPlaylistSongs(db, playlist.id), []);
  });
});

void describe("large selections", () => {
  /** Far more rows than one statement can bind. */
  const OVER_THE_LIMIT = 12_000;

  void test("skips unknown ids in lists past SQLite's variable limit", () => {
    const [known] = listSongs(db).map((song) => song.id);
    assert.ok(known);
    const unknown = Array.from(
      { length: OVER_THE_LIMIT },
      (_, index) => 1_000_000 + index,
    );
    const album = newAlbum();
    const toAlbum = addSongsToAlbum(db, album.id, [known, ...unknown]);
    assert.deepEqual(toAlbum.value.added, [known]);
    assert.equal(toAlbum.value.skipped.length, OVER_THE_LIMIT);

    const playlist = createPlaylist(db, "Everything").value;
    const toPlaylist = addSongsToPlaylist(db, playlist.id, [known, ...unknown]);
    assert.deepEqual(toPlaylist.value.added, [known]);
    assert.deepEqual(ids(listPlaylistSongs(db, playlist.id)), [known]);
  });
});
