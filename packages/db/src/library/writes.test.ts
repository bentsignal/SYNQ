import assert from "node:assert/strict";
import { beforeEach, describe, test } from "node:test";

import { eq, sql } from "drizzle-orm";

import type { LibraryDb } from "../client.ts";
import { openMigratedLibrary } from "../testing/migrated-library.ts";
import { openTestLibraryDb } from "../testing/node-sqlite.ts";
import { playlistSongs, songs } from "../schema.ts";
import {
  addSongs,
  addSongsToPlaylist,
  createAlbum,
  createArtist,
  createPlaylist,
  deleteAlbum,
  deleteArtist,
  deletePlaylist,
  deleteSongs,
  editSong,
  ensureLikedPlaylist,
  getSong,
  isSongLiked,
  LibraryError,
  listAlbumTracks,
  listPlaylistSongs,
  markSongsExported,
  moveSongInPlaylist,
  removeSongsFromPlaylist,
  renameArtist,
  renamePlaylist,
  reorderAlbumTracks,
  safeFileName,
  setArtwork,
  setPlaylistOrder,
  setSongLiked,
  setTrackNumber,
  splitArtistNames,
  updateAlbum,
} from "../index.ts";

const NOW = 1_900_000_000_000;
const ids = (items: readonly { id: number }[]) => items.map((item) => item.id);
const libraryError = (code: string) => (error: unknown) => error instanceof LibraryError && error.code === code;
/** Drizzle wraps driver errors; the SQLite message is on `cause`. */
const sqliteError = (pattern: RegExp) => (error: unknown) => pattern.test(String((error as { cause?: unknown }).cause ?? error));

let db: LibraryDb;
beforeEach(async () => {
  db = await openMigratedLibrary();
});

describe("artist name splitting", () => {
  const known = (...names: string[]) => (name: string) => names.some((n) => n.toLowerCase() === name.toLowerCase());

  test("keeps a known comma name whole and splits the rest", () => {
    assert.deepEqual(splitArtistNames("Tyler, The Creator, Kali Uchis", known("Tyler, The Creator")), ["Tyler, The Creator", "Kali Uchis"]);
    assert.deepEqual(splitArtistNames("Tyler,The Creator", known("Tyler, The Creator")), ["Tyler, The Creator"]);
    assert.deepEqual(splitArtistNames("Earth, Wind & Fire", known()), ["Earth", "Wind & Fire"]);
    assert.deepEqual(splitArtistNames(" A ,  B , a ,, ", known()), ["A", "B"]);
    assert.deepEqual(splitArtistNames("   ", known()), []);
  });
});

describe("addSongs", () => {
  test("finds artists and albums by the matching rules, creates the rest", () => {
    const result = addSongs(
      db,
      [
        // Whole known comma name + known artist; album matched ignoring case (it already has a cover).
        { title: "Who Dat Boy", fileName: "who.mp3", mimeType: "audio/mpeg", durationMs: 205_400, artists: "Tyler, The Creator, Kali Uchis", album: "flower boy", track: 2, hasArtwork: true },
        // Exact-case match wins among case variants; a new album gets the embedded cover.
        { title: "Butter", fileName: "butter.mp3", durationMs: 1, artists: "bts", album: "Butter", year: 2021, hasArtwork: true },
        // No exact match: the oldest case-insensitive one (BTS, id 3).
        { title: "Dynamite", fileName: "dyn.mp3", durationMs: 1, artists: "Bts" },
        // No album: the cover goes to the song's folder; nameless file gets a safe name.
        { title: "", fileName: "", mimeType: "audio/mpeg", durationMs: 1, artists: ["New Artist"], hasArtwork: true },
      ],
      { now: NOW },
    );
    const [whoDat, butter, dynamite, nameless] = result.value;
    assert.deepEqual(result.changed, ["album_artists", "album_songs", "albums", "artists", "song_artists", "songs"]);
    assert.deepEqual(whoDat, { id: 14, filePath: "library/14/who.mp3", artistIds: [1, 2], albumId: 1, artworkTarget: null });
    assert.deepEqual(butter?.artistIds, [4]);
    assert.deepEqual(butter?.artworkTarget, { kind: "album", id: 7, dir: "albums/7" });
    assert.deepEqual(dynamite?.artistIds, [3]);
    assert.equal(nameless?.filePath, "library/17/song.mp3");
    assert.deepEqual(nameless?.artworkTarget, { kind: "song", id: 17, dir: "library/17" });

    const song = getSong(db, 14);
    assert.equal(song?.durationMs, 205_400);
    assert.deepEqual(song?.albums.map((a) => [a.id, a.track]), [[1, 2]]);
    assert.equal(song?.addedAt, NOW);
    assert.equal(getSong(db, 15)?.addedAt, NOW + 1);
    // Flower Boy already credited both artists; Butter gets bts.
    assert.deepEqual(listAlbumTracks(db, 1).map((s) => s.id), [1, 14]);
  });

  test("never emits a path separator in a file name", () => {
    assert.equal(safeFileName("a/b\\c.mp3"), "a_b_c.mp3");
    assert.equal(safeFileName("", "audio/flac"), "song.flac");
    assert.equal(safeFileName("..", null), "song.audio");
  });
});

describe("editSong", () => {
  test("replaces artists and albums, keeps known tracks, marks modified", () => {
    const result = editSong(db, 3, {
      title: " ON (Live) ",
      artists: [{ id: 4 }, { name: "Guest" }],
      albums: [{ album: { id: 3 } }, { album: { name: "Live Set" }, track: 2 }],
    });
    assert.deepEqual(result.changed, ["album_songs", "albums", "artists", "song_artists", "songs"]);
    assert.equal(result.value.title, "ON (Live)");
    assert.deepEqual(result.value.artists.map((a) => a.name), ["bts", "Guest"]);
    assert.deepEqual(result.value.albums.map((a) => [a.name, a.track]), [["Map of the Soul: 7", null], ["Live Set", 2]]);
    assert.equal(result.value.modifiedSinceExport, true);
    markSongsExported(db, [3]);
    assert.equal(getSong(db, 3)?.modifiedSinceExport, false);
    assert.throws(() => editSong(db, 999, { title: "x" }), libraryError("not-found"));
  });
});

describe("deleteSongs", () => {
  test("cascades join rows, keeps artists and albums, returns folders to delete", () => {
    const result = deleteSongs(db, [1, 999, 1]);
    assert.deepEqual(result.value, { ids: [1], deletePaths: ["library/1"] });
    assert.equal(getSong(db, 1), null);
    assert.deepEqual(ids(listPlaylistSongs(db, 2)), [3, 5]);
    assert.deepEqual(listAlbumTracks(db, 1), []);
    const orphans = db.all(sql`SELECT * FROM song_artists WHERE song_id = 1`);
    assert.deepEqual(orphans, []);
  });
});

describe("likes and playlists", () => {
  test("like appends to Liked Songs; unlike removes", () => {
    assert.equal(isSongLiked(db, 4), false);
    assert.deepEqual(setSongLiked(db, 4, true, { now: NOW }).changed, ["playlist_songs", "playlists"]);
    assert.deepEqual(ids(listPlaylistSongs(db, 2)), [3, 1, 5, 4]);
    assert.equal(isSongLiked(db, 4), true);
    assert.deepEqual(setSongLiked(db, 4, true).changed, []);
    setSongLiked(db, 4, false);
    assert.deepEqual(ids(listPlaylistSongs(db, 2)), [3, 1, 5]);
  });

  test("ensureLikedPlaylist creates Liked Songs once", async () => {
    const { db: empty } = await openTestLibraryDb();
    const first = ensureLikedPlaylist(empty, { now: NOW });
    assert.deepEqual(first.changed, ["playlists"]);
    assert.deepEqual(ensureLikedPlaylist(empty), { value: first.value, changed: [] });
    assert.equal(ensureLikedPlaylist(db).value, 2);
  });

  test("create, rename, and delete playlists with name rules", () => {
    assert.throws(() => createPlaylist(db, " road TRIP "), libraryError("duplicate-name"));
    assert.throws(() => createPlaylist(db, "   "), libraryError("empty-name"));
    const chill = createPlaylist(db, "  Chill  ", { now: NOW }).value;
    assert.deepEqual([chill.name, chill.kind, chill.songCount, chill.createdAt], ["Chill", "user", 0, NOW]);
    assert.equal(renamePlaylist(db, 2, "Liked").value.name, "Liked");
    assert.equal(renamePlaylist(db, 3, "road trip").value.name, "road trip");
    assert.throws(() => deletePlaylist(db, 2), libraryError("liked-playlist"));
    assert.deepEqual(deletePlaylist(db, 3).value, { deletePaths: ["playlists/3"] });
    assert.deepEqual(db.select().from(playlistSongs).where(eq(playlistSongs.playlistId, 3)).all(), []);
  });

  test("add skips songs already present or missing; remove reports a count", () => {
    assert.deepEqual(addSongsToPlaylist(db, 3, [1, 4, 4, 999]).value, { added: [4], skipped: [1, 999] });
    assert.deepEqual(ids(listPlaylistSongs(db, 3)), [2, 1, 6, 7, 4]);
    assert.deepEqual(removeSongsFromPlaylist(db, 3, [1, 2]).value, { removed: 2 });
    assert.deepEqual(ids(listPlaylistSongs(db, 3)), [6, 7, 4]);
    assert.throws(() => addSongsToPlaylist(db, 999, [1]), libraryError("not-found"));
  });

  test("a move writes one row (the midpoint of its new neighbours)", () => {
    const before = listPlaylistSongs(db, 3).map((s) => [s.id, s.position]);
    assert.deepEqual(before, [[2, 1], [1, 2], [6, 3], [7, 4]]);
    assert.equal(moveSongInPlaylist(db, 3, 7, 0).value.position, 0);
    assert.equal(moveSongInPlaylist(db, 3, 2, 2).value.position, 2.5);
    assert.deepEqual(listPlaylistSongs(db, 3).map((s) => [s.id, s.position]), [[7, 0], [1, 2], [2, 2.5], [6, 3]]);
    assert.equal(moveSongInPlaylist(db, 3, 6, 99).value.position, 3);
    assert.throws(() => moveSongInPlaylist(db, 3, 5, 0), libraryError("not-found"));
  });

  test("sets a whole new order in one write, keeping unlisted songs after", () => {
    setPlaylistOrder(db, 3, [7, 6, 999, 7]);
    assert.deepEqual(listPlaylistSongs(db, 3).map((s) => [s.id, s.position]), [[7, 1], [6, 2], [2, 3], [1, 4]]);
    setPlaylistOrder(db, 3, [1, 2, 6, 7]);
    assert.deepEqual(ids(listPlaylistSongs(db, 3)), [1, 2, 6, 7]);
    assert.throws(() => setPlaylistOrder(db, 999, [1]), libraryError("not-found"));
  });

  test("renumbers when repeated moves exhaust the gap, keeping order and uniqueness", () => {
    // Keep dropping the last song between the first two: each move halves the gap.
    for (let i = 0; i < 80; i++) {
      const order = ids(listPlaylistSongs(db, 3));
      moveSongInPlaylist(db, 3, order[order.length - 1] ?? 0, 1);
    }
    const entries = listPlaylistSongs(db, 3);
    assert.equal(entries.length, 4);
    assert.equal(new Set(entries.map((e) => e.position)).size, 4);
    const positions = entries.map((e) => e.position);
    assert.deepEqual([...positions].sort((a, b) => a - b), positions);
  });
});

describe("albums and artists", () => {
  test("album CRUD and track order", () => {
    assert.throws(() => createAlbum(db, { name: "flower BOY" }), libraryError("duplicate-name"));
    const album = createAlbum(db, { name: "New", year: 2020, artistIds: [2, 1, 2] }, { now: NOW }).value;
    assert.deepEqual(album.artists.map((a) => a.id), [2, 1]);
    editSong(db, 4, { albums: [{ album: { id: album.id }, track: 2 }] });
    editSong(db, 12, { albums: [{ album: { id: album.id }, track: 1 }] });
    assert.deepEqual(ids(listAlbumTracks(db, album.id)), [12, 4]);
    reorderAlbumTracks(db, album.id, [4, 12]);
    assert.deepEqual(listAlbumTracks(db, album.id).map((s) => [s.id, s.track]), [[4, 1], [12, 2]]);
    setTrackNumber(db, album.id, 12, null);
    assert.deepEqual(ids(listAlbumTracks(db, album.id)), [4, 12]);

    markSongsExported(db, [4, 12]);
    const updated = updateAlbum(db, album.id, { year: 2021 });
    assert.deepEqual(updated.changed, ["albums", "songs"]);
    assert.equal(getSong(db, 4)?.modifiedSinceExport, true);
    // A legacy duplicate name doesn't block editing other fields.
    assert.equal(updateAlbum(db, 1, { name: "Flower Boy", year: 2018 }).value.year, 2018);

    assert.deepEqual(deleteAlbum(db, album.id).value, { deletePaths: [`albums/${album.id}`] });
    assert.deepEqual(getSong(db, 4)?.albums, []);
  });

  test("artist CRUD keeps songs when an artist is deleted", () => {
    assert.throws(() => createArtist(db, "kali uchis"), libraryError("duplicate-name"));
    assert.equal(createArtist(db, "Someone", { now: NOW }).value.songCount, 0);
    // A case-only rename onto another artist's exact spelling is refused...
    assert.throws(() => renameArtist(db, 4, "BTS "), libraryError("duplicate-name"));
    // ...but case variants may keep their names, and a case-only change of one's own name is fine.
    assert.equal(renameArtist(db, 4, "Bts").value.name, "Bts");
    assert.equal(renameArtist(db, 4, "BTS (Japan)").value.name, "BTS (Japan)");
    assert.deepEqual(deleteArtist(db, 2).value, { deletePaths: ["artists/2"] });
    assert.deepEqual(getSong(db, 2)?.artists, []);
    assert.ok(getSong(db, 2));
  });

  test("artwork versions bump and clear; album art marks its songs modified", () => {
    markSongsExported(db, [1]);
    const set = setArtwork(db, "album", 1, true, { now: NOW });
    assert.deepEqual(set.value, { artwork: { kind: "album", id: 1, version: NOW }, dir: "albums/1" });
    assert.equal(getSong(db, 1)?.modifiedSinceExport, true);
    assert.deepEqual(getSong(db, 1)?.artwork, { kind: "album", id: 1, version: NOW });
    setArtwork(db, "album", 1, false);
    assert.equal(getSong(db, 1)?.artwork, null);
    assert.equal(setArtwork(db, "playlist", 3, true, { now: NOW }).value.artwork?.version, NOW);
    assert.throws(() => setArtwork(db, "artist", 999, true), libraryError("not-found"));
  });
});

describe("constraints", () => {
  test("foreign keys and the playlist uniques are enforced by the schema", () => {
    assert.throws(() => db.run(sql`INSERT INTO song_artists (song_id, artist_id, position) VALUES (999, 1, 0)`), sqliteError(/FOREIGN KEY/));
    assert.throws(() => db.run(sql`INSERT INTO playlist_songs (playlist_id, song_id, position) VALUES (3, 1, 9)`), sqliteError(/UNIQUE/));
    assert.throws(() => db.run(sql`INSERT INTO playlist_songs (playlist_id, song_id, position) VALUES (3, 4, 1)`), sqliteError(/UNIQUE/));
    assert.throws(() => db.run(sql`INSERT INTO playlists (name, kind, created_at, updated_at) VALUES ('x', 'liked', 1, 1)`), sqliteError(/UNIQUE/));
    db.delete(songs).where(eq(songs.id, 2)).run();
    assert.deepEqual(db.all(sql`PRAGMA foreign_key_check`), []);
  });
});
