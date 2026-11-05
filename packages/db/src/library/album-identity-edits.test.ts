/**
 * Same-named albums everywhere but import: covers, New Album and Edit Album, a
 * song's edit form, its picker, and what a 2.5.2 library keeps.
 */
import assert from "node:assert/strict";
import { beforeEach, describe, test } from "node:test";

import type { LibraryDb } from "../client.ts";
import { importBatch, song } from "../testing/album-batches.ts";
import { dumpLibrary } from "../testing/dump-library.ts";
import { openMigratedLibrary } from "../testing/migrated-library.ts";
import { openTestLibraryDb } from "../testing/node-sqlite.ts";
import { canAddAlbumNamed } from "./album-identity.ts";
import {
  createAlbum,
  listAlbums,
  listAlbumTracks,
  updateAlbum,
} from "./albums.ts";
import { LibraryError } from "./errors.ts";
import { editSong } from "./song-writes.ts";

let db: LibraryDb;

beforeEach(async () => {
  ({ db } = await openTestLibraryDb());
});

void describe("the cover of a same-named album", () => {
  void test("each album gets its own cover, from its own first song", () => {
    const [queen, abba] = importBatch(
      db,
      song("Hits", "Queen", { albumArtists: "Queen", hasArtwork: true }),
      song("Hits", "ABBA", { albumArtists: "ABBA", hasArtwork: true }),
    );
    assert.equal(queen?.artworkTarget?.kind, "album");
    assert.equal(abba?.artworkTarget?.kind, "album");
    assert.notEqual(queen.artworkTarget.id, abba.artworkTarget.id);
  });
});

void describe("creating and renaming albums", () => {
  function artistsOf(...names: string[]) {
    const [added] = importBatch(db, song("seed", names.join(", ")));
    return added?.artistIds ?? [];
  }

  void test("a name can be shared by different artists", () => {
    const [queen = 0, abba = 0] = artistsOf("Queen", "ABBA");
    createAlbum(db, { artistIds: [queen], name: "Hits" });
    const second = createAlbum(db, { artistIds: [abba], name: "hits" });
    assert.equal(second.value.name, "hits");
  });

  void test("the same name and artist is refused, as is no artist to tell them apart", () => {
    const [queen = 0] = artistsOf("Queen");
    createAlbum(db, { artistIds: [queen], name: "Hits" });
    function refused(error: unknown) {
      return error instanceof LibraryError && error.code === "duplicate-name";
    }
    assert.throws(
      () => createAlbum(db, { artistIds: [queen], name: "HITS" }),
      refused,
    );
    assert.throws(() => createAlbum(db, { name: "Hits" }), refused);
  });

  void test("either of two same-named albums can still be edited", () => {
    const [queen = 0, abba = 0] = artistsOf("Queen", "ABBA");
    const first = createAlbum(db, { artistIds: [queen], name: "Hits" }).value;
    createAlbum(db, { artistIds: [abba], name: "Hits" });
    const edited = updateAlbum(db, first.id, {
      artistIds: [queen],
      name: "Hits",
      year: 1981,
    });
    assert.equal(edited.value.year, 1981);
  });

  void test("editing onto the other's artists is refused", () => {
    const [queen = 0, abba = 0] = artistsOf("Queen", "ABBA");
    const first = createAlbum(db, { artistIds: [queen], name: "Hits" }).value;
    createAlbum(db, { artistIds: [abba], name: "Hits" });
    assert.throws(() => updateAlbum(db, first.id, { artistIds: [abba] }));
  });
});

void describe("editing a song's album", () => {
  function twoHits() {
    const [queen, abba] = importBatch(
      db,
      song("Hits", "Queen", { albumArtists: "Queen" }),
      song("Hits", "ABBA", { albumArtists: "ABBA" }),
    );
    assert.ok(queen && abba);
    return { abba, queen };
  }

  void test("a pick by id is exactly that album", () => {
    const { abba, queen } = twoHits();
    const edited = editSong(db, queen.id, {
      album: { album: { id: abba.albumId ?? 0 } },
    });
    assert.equal(edited.value.albums[0]?.id, abba.albumId);
  });

  void test("a typed name means the one this song's artists are on", () => {
    const { abba, queen } = twoHits();
    const [extra] = importBatch(db, song("Other", "ABBA"));
    const edited = editSong(db, extra?.id ?? 0, {
      album: { album: { name: "HITS" } },
    });
    const [album] = edited.value.albums;
    assert.ok(album);
    assert.equal(album.id, abba.albumId);
    assert.notEqual(album.id, queen.albumId);
  });

  void test("a typed name no album of these artists has is a new one, credited to them", () => {
    twoHits();
    const [extra] = importBatch(db, song("Other", "Elton John"));
    const edited = editSong(db, extra?.id ?? 0, {
      album: { album: { name: "Hits" } },
    });
    const album = listAlbums(db).find(
      (candidate) => candidate.id === edited.value.albums[0]?.id,
    );
    assert.deepEqual(
      album?.artists.map((artist) => artist.name),
      ["Elton John"],
    );
    assert.equal(listAlbums(db).filter((row) => row.name === "Hits").length, 3);
  });

  void test("a brand new name is credited to the song's artists", () => {
    const [extra] = importBatch(db, song("Other", "A"));
    const edited = editSong(db, extra?.id ?? 0, {
      album: { album: { name: "Fresh" } },
    });
    const album = listAlbums(db).find(
      (candidate) => candidate.id === edited.value.albums[0]?.id,
    );
    assert.deepEqual(
      album?.artists.map((artist) => artist.name),
      ["A"],
    );
  });

  void test("the artists edited in the same save decide", () => {
    const { abba, queen } = twoHits();
    const edited = editSong(db, queen.id, {
      album: { album: { name: "Hits" } },
      artists: [{ name: "ABBA" }],
    });
    assert.equal(edited.value.albums[0]?.id, abba.albumId);
  });

  void test("a move leaves the other same-named album's songs where they are", () => {
    const { abba, queen } = twoHits();
    editSong(db, queen.id, { album: { album: { id: abba.albumId ?? 0 } } });
    assert.equal(listAlbumTracks(db, abba.albumId ?? 0).length, 2);
    assert.equal(listAlbumTracks(db, queen.albumId ?? 0).length, 0);
  });
});

void describe("whether the picker offers a typed album name as new", () => {
  const albumsList = [
    { artists: [{ name: "Queen" }], name: "Greatest Hits" },
    { artists: [], name: "Nobody's" },
  ];

  void test("a name nobody has", () => {
    assert.equal(canAddAlbumNamed("Fresh", albumsList, ["Queen"]), true);
  });

  void test("a name someone else has", () => {
    assert.equal(canAddAlbumNamed("greatest hits", albumsList, ["ABBA"]), true);
  });

  void test("not a name these artists have", () => {
    assert.equal(
      canAddAlbumNamed("GREATEST HITS", albumsList, ["QUEEN"]),
      false,
    );
  });

  void test("not with nobody to tell them apart, either way", () => {
    assert.equal(canAddAlbumNamed("Greatest Hits", albumsList, []), false);
    assert.equal(canAddAlbumNamed("Nobody's", albumsList, ["Queen"]), false);
  });
});

void describe("a library that came from 2.5.2", () => {
  void test("its albums stay exactly as they are when new songs arrive", async () => {
    db = await openMigratedLibrary();
    const before = dumpLibrary(db);
    const [album] = before.albums;
    assert.ok(album);
    importBatch(db, song(album.name, "Someone New Entirely", { track: 999 }));
    const after = dumpLibrary(db);
    for (const row of before.albums) {
      assert.deepEqual(
        after.albums.find((other) => other.id === row.id),
        row,
      );
    }
    assert.deepEqual(
      after.albumArtists.filter((row) =>
        before.albums.some((a) => a.id === row.albumId),
      ),
      before.albumArtists,
    );
    for (const row of before.albumSongs) {
      assert.ok(
        after.albumSongs.some(
          (other) =>
            other.albumId === row.albumId &&
            other.songId === row.songId &&
            other.track === row.track,
        ),
      );
    }
  });
});
