import assert from "node:assert/strict";
import { beforeEach, describe, test } from "node:test";
import { eq, sql } from "drizzle-orm";

import type { LibraryDb } from "../client.ts";
import {
  createAlbum,
  createArtist,
  deleteAlbum,
  deleteArtist,
  editSong,
  getSong,
  listAlbumTracks,
  markSongsExported,
  renameArtist,
  reorderAlbumTracks,
  setArtwork,
  setTrackNumber,
  updateAlbum,
} from "../index.ts";
import { songs } from "../schema.ts";
import { openMigratedLibrary } from "../testing/migrated-library.ts";
import {
  ids,
  libraryError,
  NOW,
  sqliteError,
} from "../testing/write-test-helpers.ts";

let db: LibraryDb;
beforeEach(async () => {
  db = await openMigratedLibrary();
});

void describe("albums and artists", () => {
  void test("album CRUD and track order", () => {
    assert.throws(
      () => createAlbum(db, { name: "flower BOY" }),
      libraryError("duplicate-name"),
    );
    const album = createAlbum(
      db,
      { name: "New", year: 2020, artistIds: [2, 1, 2] },
      { now: NOW },
    ).value;
    assert.deepEqual(
      album.artists.map((a) => a.id),
      [2, 1],
    );
    editSong(db, 4, { albums: [{ album: { id: album.id }, track: 2 }] });
    editSong(db, 12, { albums: [{ album: { id: album.id }, track: 1 }] });
    assert.deepEqual(ids(listAlbumTracks(db, album.id)), [12, 4]);
    reorderAlbumTracks(db, album.id, [4, 12]);
    assert.deepEqual(
      listAlbumTracks(db, album.id).map((s) => [s.id, s.track]),
      [
        [4, 1],
        [12, 2],
      ],
    );
    setTrackNumber(db, album.id, 12, null);
    assert.deepEqual(ids(listAlbumTracks(db, album.id)), [4, 12]);

    markSongsExported(db, [4, 12]);
    const updated = updateAlbum(db, album.id, { year: 2021 });
    assert.deepEqual(updated.changed, ["albums", "songs"]);
    assert.equal(getSong(db, 4)?.modifiedSinceExport, true);
    // A legacy duplicate name doesn't block editing other fields.
    assert.equal(
      updateAlbum(db, 1, { name: "Flower Boy", year: 2018 }).value.year,
      2018,
    );

    assert.deepEqual(deleteAlbum(db, album.id).value, {
      deletePaths: [`albums/${album.id}`],
    });
    assert.deepEqual(getSong(db, 4)?.albums, []);
  });

  void test("artist CRUD keeps songs when an artist is deleted", () => {
    assert.throws(
      () => createArtist(db, "kali uchis"),
      libraryError("duplicate-name"),
    );
    assert.equal(createArtist(db, "Someone", { now: NOW }).value.songCount, 0);
    // A case-only rename onto another artist's exact spelling is refused...
    assert.throws(
      () => renameArtist(db, 4, "BTS "),
      libraryError("duplicate-name"),
    );
    // ...but case variants may keep their names, and a case-only change of one's own name is fine.
    assert.equal(renameArtist(db, 4, "Bts").value.name, "Bts");
    assert.equal(renameArtist(db, 4, "BTS (Japan)").value.name, "BTS (Japan)");
    assert.deepEqual(deleteArtist(db, 2).value, { deletePaths: ["artists/2"] });
    assert.deepEqual(getSong(db, 2)?.artists, []);
    assert.ok(getSong(db, 2));
  });

  void test("artwork versions bump and clear; album art marks its songs modified", () => {
    markSongsExported(db, [1]);
    const set = setArtwork(
      db,
      { kind: "album", id: 1, present: true },
      { now: NOW },
    );
    assert.deepEqual(set.value, {
      artwork: { kind: "album", id: 1, version: NOW },
      dir: "albums/1",
    });
    assert.equal(getSong(db, 1)?.modifiedSinceExport, true);
    assert.deepEqual(getSong(db, 1)?.artwork, {
      kind: "album",
      id: 1,
      version: NOW,
    });
    setArtwork(db, { kind: "album", id: 1, present: false });
    assert.equal(getSong(db, 1)?.artwork, null);
    assert.equal(
      setArtwork(db, { kind: "playlist", id: 3, present: true }, { now: NOW })
        .value.artwork?.version,
      NOW,
    );
    assert.throws(
      () => setArtwork(db, { kind: "artist", id: 999, present: true }),
      libraryError("not-found"),
    );
  });
});

void describe("constraints", () => {
  void test("foreign keys and the playlist uniques are enforced by the schema", () => {
    assert.throws(
      () =>
        db.run(
          sql`INSERT INTO song_artists (song_id, artist_id, position) VALUES (999, 1, 0)`,
        ),
      sqliteError(/FOREIGN KEY/),
    );
    assert.throws(
      () =>
        db.run(
          sql`INSERT INTO playlist_songs (playlist_id, song_id, position) VALUES (3, 1, 9)`,
        ),
      sqliteError(/UNIQUE/),
    );
    assert.throws(
      () =>
        db.run(
          sql`INSERT INTO playlist_songs (playlist_id, song_id, position) VALUES (3, 4, 1)`,
        ),
      sqliteError(/UNIQUE/),
    );
    assert.throws(
      () =>
        db.run(
          sql`INSERT INTO playlists (name, kind, created_at, updated_at) VALUES ('x', 'liked', 1, 1)`,
        ),
      sqliteError(/UNIQUE/),
    );
    db.delete(songs).where(eq(songs.id, 2)).run();
    assert.deepEqual(db.all(sql`PRAGMA foreign_key_check`), []);
  });
});
