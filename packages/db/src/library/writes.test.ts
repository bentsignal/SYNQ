import assert from "node:assert/strict";
import { beforeEach, describe, test } from "node:test";
import { sql } from "drizzle-orm";

import type { LibraryDb } from "../client.ts";
import {
  addSongs,
  deleteSongs,
  editSong,
  getSong,
  listAlbumTracks,
  listPlaylistSongs,
  markSongsExported,
  safeFileName,
  splitArtistNames,
} from "../index.ts";
import { openMigratedLibrary } from "../testing/migrated-library.ts";
import { ids, libraryError, NOW } from "../testing/write-test-helpers.ts";

let db: LibraryDb;
beforeEach(async () => {
  db = await openMigratedLibrary();
});

void describe("artist name splitting", () => {
  function known(...names: string[]) {
    return (name: string) =>
      names.some((n) => n.toLowerCase() === name.toLowerCase());
  }

  void test("keeps a known comma name whole and splits the rest", () => {
    assert.deepEqual(
      splitArtistNames(
        "Tyler, The Creator, Kali Uchis",
        known("Tyler, The Creator"),
      ),
      ["Tyler, The Creator", "Kali Uchis"],
    );
    assert.deepEqual(
      splitArtistNames("Tyler,The Creator", known("Tyler, The Creator")),
      ["Tyler, The Creator"],
    );
    assert.deepEqual(splitArtistNames("Earth, Wind & Fire", known()), [
      "Earth",
      "Wind & Fire",
    ]);
    assert.deepEqual(splitArtistNames(" A ,  B , a ,, ", known()), ["A", "B"]);
    assert.deepEqual(splitArtistNames("   ", known()), []);
  });
});

void describe("addSongs", () => {
  void test("finds artists and albums by the matching rules, creates the rest", () => {
    const result = addSongs(
      db,
      [
        // Whole known comma name + known artist; album matched ignoring case (it already has a cover).
        {
          title: "Who Dat Boy",
          fileName: "who.mp3",
          mimeType: "audio/mpeg",
          durationMs: 205_400,
          artists: "Tyler, The Creator, Kali Uchis",
          album: "flower boy",
          track: 2,
          hasArtwork: true,
        },
        // Exact-case match wins among case variants; a new album gets the embedded cover.
        {
          title: "Butter",
          fileName: "butter.mp3",
          durationMs: 1,
          artists: "bts",
          album: "Butter",
          year: 2021,
          hasArtwork: true,
        },
        // No exact match: the oldest case-insensitive one (BTS, id 3).
        {
          title: "Dynamite",
          fileName: "dyn.mp3",
          durationMs: 1,
          artists: "Bts",
        },
        // No album: the cover goes to the song's folder; nameless file gets a safe name.
        {
          title: "",
          fileName: "",
          mimeType: "audio/mpeg",
          durationMs: 1,
          artists: ["New Artist"],
          hasArtwork: true,
        },
      ],
      { now: NOW },
    );
    const [whoDat, butter, dynamite, nameless] = result.value;
    assert.deepEqual(result.changed, [
      "album_artists",
      "album_songs",
      "albums",
      "artists",
      "song_artists",
      "songs",
    ]);
    assert.deepEqual(whoDat, {
      id: 17,
      filePath: "library/17/who.mp3",
      artistIds: [1, 2],
      albumId: 1,
      artworkTarget: null,
    });
    assert.deepEqual(butter?.artistIds, [4]);
    assert.deepEqual(butter.artworkTarget, {
      kind: "album",
      id: 7,
      dir: "albums/7",
    });
    assert.deepEqual(dynamite?.artistIds, [3]);
    assert.equal(nameless?.filePath, "library/20/song.mp3");
    assert.deepEqual(nameless.artworkTarget, {
      kind: "song",
      id: 20,
      dir: "library/20",
    });

    const song = getSong(db, 17);
    assert.equal(song?.durationMs, 205_400);
    assert.deepEqual(
      song.albums.map((a) => [a.id, a.track]),
      [[1, 2]],
    );
    assert.equal(song.addedAt, NOW);
    assert.equal(getSong(db, 18)?.addedAt, NOW + 1);
    // Flower Boy already credited both artists; Butter gets bts.
    assert.deepEqual(
      listAlbumTracks(db, 1).map((s) => s.id),
      [1, 17],
    );
  });

  void test("never emits a path separator in a file name", () => {
    assert.equal(safeFileName("a/b\\c.mp3"), "a_b_c.mp3");
    assert.equal(safeFileName("", "audio/flac"), "song.flac");
    assert.equal(safeFileName("..", null), "song.audio");
  });
});

void describe("editSong", () => {
  void test("replaces artists and albums, keeps known tracks, marks modified", () => {
    const result = editSong(db, 3, {
      title: " ON (Live) ",
      artists: [{ id: 4 }, { name: "Guest" }],
      albums: [{ album: { id: 3 } }, { album: { name: "Live Set" }, track: 2 }],
    });
    assert.deepEqual(result.changed, [
      "album_artists",
      "album_songs",
      "albums",
      "artists",
      "song_artists",
      "songs",
    ]);
    assert.equal(result.value.title, "ON (Live)");
    assert.deepEqual(
      result.value.artists.map((a) => a.name),
      ["bts", "Guest"],
    );
    assert.deepEqual(
      result.value.albums.map((a) => [a.name, a.track]),
      [
        ["Map of the Soul: 7", null],
        ["Live Set", 2],
      ],
    );
    assert.equal(result.value.modifiedSinceExport, true);
    markSongsExported(db, [3]);
    assert.equal(getSong(db, 3)?.modifiedSinceExport, false);
    assert.throws(
      () => editSong(db, 999, { title: "x" }),
      libraryError("not-found"),
    );
  });
});

void describe("deleteSongs", () => {
  void test("cascades join rows, keeps artists and albums, returns folders to delete", () => {
    const result = deleteSongs(db, [1, 999, 1]);
    assert.deepEqual(result.value, { ids: [1], deletePaths: ["library/1"] });
    assert.equal(getSong(db, 1), null);
    assert.deepEqual(ids(listPlaylistSongs(db, 2)), [3, 5]);
    assert.deepEqual(listAlbumTracks(db, 1), []);
    const orphans = db.all(sql`SELECT * FROM song_artists WHERE song_id = 1`);
    assert.deepEqual(orphans, []);
  });
});
