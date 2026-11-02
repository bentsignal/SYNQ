/**
 * Same-named albums at import: docs/rewrite.md → Same-named albums. An album is
 * its name and its artists. What can't be told apart stays one album; a
 * compilation stays one album however it's tagged.
 */
import assert from "node:assert/strict";
import { beforeEach, describe, test } from "node:test";

import type { LibraryDb } from "../client.ts";
import { albumsOf, importBatch, song } from "../testing/album-batches.ts";
import { openTestLibraryDb } from "../testing/node-sqlite.ts";
import { createAlbum, listAlbums, updateAlbum } from "./albums.ts";
import { addSongs } from "./song-writes.ts";

let db: LibraryDb;

beforeEach(async () => {
  ({ db } = await openTestLibraryDb());
});

void describe("same-named albums, by album artist", () => {
  void test("two albums by different album artists stay apart", () => {
    const [queen, abba] = importBatch(
      db,
      song("Greatest Hits", "Queen", { albumArtists: "Queen", track: 1 }),
      song("Greatest Hits", "ABBA", { albumArtists: "ABBA", track: 2 }),
    );
    assert.notEqual(queen?.albumId, abba?.albumId);
    assert.deepEqual(albumsOf(db), [
      { artists: ["ABBA"], name: "Greatest Hits", songs: 1 },
      { artists: ["Queen"], name: "Greatest Hits", songs: 1 },
    ]);
  });

  void test("a compilation with an album artist is one album, credited to it alone", () => {
    importBatch(
      db,
      song("Now 50", "A", { albumArtists: "Various Artists", track: 1 }),
      song("Now 50", "B", { albumArtists: "Various Artists", track: 2 }),
      song("Now 50", "C", { albumArtists: "Various Artists", track: 3 }),
    );
    assert.deepEqual(albumsOf(db), [
      { artists: ["Various Artists"], name: "Now 50", songs: 3 },
    ]);
  });

  void test("a featured artist doesn't reach the album's credits", () => {
    importBatch(
      db,
      song("Igor", "Tyler, Kali Uchis", { albumArtists: "Tyler" }),
      song("Igor", "Tyler", { albumArtists: "Tyler" }),
    );
    assert.deepEqual(albumsOf(db), [
      { artists: ["Tyler"], name: "Igor", songs: 2 },
    ]);
  });

  void test("the same album in two batches joins up", () => {
    importBatch(
      db,
      song("Now 50", "A", { albumArtists: "Various Artists", track: 1 }),
    );
    importBatch(
      db,
      song("Now 50", "D", { albumArtists: "Various Artists", track: 2 }),
    );
    assert.equal(albumsOf(db).length, 1);
  });

  void test("the same tracks in two batches join up, track numbers and all", () => {
    importBatch(db, song("Hits", "A", { albumArtists: "A", track: 1 }));
    importBatch(db, song("Hits", "A", { albumArtists: "A", track: 1 }));
    assert.deepEqual(albumsOf(db), [
      { artists: ["A"], name: "Hits", songs: 2 },
    ]);
  });

  void test("an album with nobody credited takes the album artist", () => {
    const { value } = createAlbum(db, { name: "Mix" });
    const [added] = importBatch(db, song("Mix", "A", { albumArtists: "B" }));
    assert.equal(added?.albumId, value.id);
    assert.deepEqual(albumsOf(db), [{ artists: ["B"], name: "Mix", songs: 1 }]);
  });

  void test("of several, it joins the one with exactly these artists", () => {
    const [seed] = importBatch(db, song("seed", "A, B"));
    const [a = 0, b = 0] = seed?.artistIds ?? [];
    createAlbum(db, { artistIds: [b], name: "Solo B" });
    const duo = createAlbum(db, { artistIds: [a, b], name: "Duo" }).value;
    const solo = updateAlbum(
      db,
      listAlbums(db).find((row) => row.name === "Solo B")?.id ?? 0,
      {
        name: "Duo Two",
      },
    ).value;
    assert.notEqual(solo.id, duo.id);
    const [added] = importBatch(
      db,
      song("Duo", "A, B", { albumArtists: "A, B" }),
    );
    assert.equal(added?.albumId, duo.id);
  });

  void test("a 2.5.2-style album crediting every track's artist still takes its tracks", () => {
    // Imported by 2.5.2: one row crediting everyone on it, no album artist.
    importBatch(db, song("Mix", "A"), song("Mix", "B"));
    const [added] = importBatch(
      db,
      song("Mix", "A", { albumArtists: "Various Artists", compilation: true }),
    );
    assert.equal(albumsOf(db).length, 1);
    assert.deepEqual(albumsOf(db)[0]?.artists, ["A", "B"], "credits stay");
    assert.ok(added?.albumId);
  });
});

void describe("same-named albums, by compilation flag", () => {
  void test("a compilation with no album artist is one album by Various Artists", () => {
    importBatch(
      db,
      song("Now 50", "A", { compilation: true, track: 1 }),
      song("Now 50", "B", { compilation: true, track: 1 }),
    );
    assert.deepEqual(albumsOf(db), [
      { artists: ["Various Artists"], name: "Now 50", songs: 2 },
    ]);
  });

  void test("it carries on in a later batch, and stays apart from an artist's own", () => {
    importBatch(db, song("Hits", "Queen", { albumArtists: "Queen" }));
    importBatch(db, song("Hits", "A", { compilation: true }));
    importBatch(db, song("Hits", "B", { compilation: true }));
    assert.deepEqual(albumsOf(db), [
      { artists: ["Queen"], name: "Hits", songs: 1 },
      { artists: ["Various Artists"], name: "Hits", songs: 2 },
    ]);
  });

  void test("an album artist wins over the flag", () => {
    importBatch(
      db,
      song("X", "A", { albumArtists: "DJ Mix", compilation: true }),
    );
    assert.deepEqual(albumsOf(db)[0]?.artists, ["DJ Mix"]);
  });
});

void describe("same-named albums, with no album artist", () => {
  void test("two artists' albums in one batch stay apart: their track numbers clash", () => {
    importBatch(
      db,
      song("Greatest Hits", "Queen", { track: 1 }),
      song("Greatest Hits", "ABBA", { track: 1 }),
      song("Greatest Hits", "Queen", { track: 2 }),
      song("Greatest Hits", "ABBA", { track: 2 }),
    );
    assert.deepEqual(albumsOf(db), [
      { artists: ["ABBA"], name: "Greatest Hits", songs: 2 },
      { artists: ["Queen"], name: "Greatest Hits", songs: 2 },
    ]);
  });

  void test("two artists' albums in two batches stay apart", () => {
    importBatch(db, song("Greatest Hits", "Queen", { track: 1 }));
    importBatch(db, song("Greatest Hits", "ABBA", { track: 2 }));
    assert.equal(albumsOf(db).length, 2);
  });

  void test("an unflagged compilation in one batch is one album", () => {
    importBatch(
      db,
      song("Summer Mix", "A", { track: 1 }),
      song("Summer Mix", "B", { track: 2 }),
      song("Summer Mix", "C", { track: 3 }),
      song("Summer Mix", "D"),
    );
    assert.deepEqual(albumsOf(db), [
      { artists: ["A", "B", "C", "D"], name: "Summer Mix", songs: 4 },
    ]);
  });

  void test("re-importing an unflagged compilation joins it up again", () => {
    importBatch(
      db,
      song("Summer Mix", "A", { track: 1 }),
      song("Summer Mix", "B", { track: 2 }),
    );
    importBatch(
      db,
      song("Summer Mix", "B", { track: 2 }),
      song("Summer Mix", "A", { track: 1 }),
    );
    assert.deepEqual(albumsOf(db), [
      { artists: ["A", "B"], name: "Summer Mix", songs: 4 },
    ]);
  });

  void test("in a later batch, a new artist's song has nothing to say it belongs", () => {
    importBatch(
      db,
      song("Greatest Hits", "Queen", { track: 1 }),
      song("Greatest Hits", "ABBA", { track: 2 }),
    );
    importBatch(db, song("Greatest Hits", "Elton John", { track: 18 }));
    assert.equal(albumsOf(db).length, 2);
  });

  void test("a song whose track is taken in its batch starts a different album", () => {
    importBatch(
      db,
      song("Summer Mix", "A", { track: 1 }),
      song("Summer Mix", "B", { track: 2 }),
      song("Summer Mix", "Z", { track: 2 }),
    );
    assert.equal(albumsOf(db).length, 2);
  });
});

void describe("same-named albums, with no album artist, and no artist in common", () => {
  void test("a batch ends: a single-artist album from before stays that artist's", () => {
    importBatch(db, song("Hits", "A", { track: 1 }));
    importBatch(db, song("Hits", "B", { track: 2 }));
    assert.equal(albumsOf(db).length, 2);
  });

  void test("sharing an artist joins, even when a track number clashes", () => {
    importBatch(db, song("Hits", "A", { track: 1 }));
    importBatch(db, song("Hits", "A, Guest", { track: 1 }));
    assert.deepEqual(albumsOf(db), [
      { artists: ["A", "Guest"], name: "Hits", songs: 2 },
    ]);
  });

  void test("an album with nobody credited takes a song and its artists", () => {
    const { value } = createAlbum(db, { name: "Mix" });
    const [added] = importBatch(db, song("Mix", "A"));
    assert.equal(added?.albumId, value.id);
    assert.deepEqual(albumsOf(db)[0]?.artists, ["A"]);
  });

  void test("a song with no artist has nothing against any album of the name", () => {
    importBatch(db, song("Hits", "A"));
    importBatch(db, { ...song("Hits", ""), artists: null });
    assert.deepEqual(albumsOf(db), [
      { artists: ["A"], name: "Hits", songs: 2 },
    ]);
  });

  void test("and joins the one with nobody credited, if there is one", () => {
    const empty = createAlbum(db, { name: "Hits" }).value;
    importBatch(db, song("Hits", "A", { albumArtists: "A" }));
    const empty2 = createAlbum(db, { name: "Mix" }).value;
    const [first] = importBatch(db, { ...song("Mix", ""), artists: null });
    assert.equal(first?.albumId, empty2.id);
    assert.deepEqual(
      listAlbums(db)
        .find((row) => row.id === empty.id)
        ?.artists.map((a) => a.name),
      ["A"],
    );
  });

  void test("an album-artist album never takes in another artist's untagged song", () => {
    importBatch(db, song("Hits", "Queen", { albumArtists: "Queen", track: 1 }));
    importBatch(db, song("Hits", "Queen", { albumArtists: "Queen", track: 2 }));
    importBatch(db, song("Hits", "ABBA", { track: 9 }));
    assert.equal(albumsOf(db).length, 2);
  });

  void test("in one batch too: a tagged album isn't open to an untagged song", () => {
    importBatch(
      db,
      song("Hits", "Queen", { albumArtists: "Queen", track: 1 }),
      song("Hits", "ABBA", { track: 9 }),
    );
    assert.equal(albumsOf(db).length, 2);
  });

  void test("names match ignoring case, an exact spelling first, as before", () => {
    importBatch(db, song("night drive", "A"));
    const [added] = importBatch(db, song("Night Drive", "A"));
    assert.equal(albumsOf(db).length, 1);
    assert.equal(listAlbums(db)[0]?.id, added?.albumId);
  });

  void test("several songs in one call share a batch", () => {
    addSongs(db, [
      song("Summer Mix", "A", { track: 1 }),
      song("Summer Mix", "B", { track: 2 }),
    ]);
    assert.equal(albumsOf(db).length, 1);
  });
});
