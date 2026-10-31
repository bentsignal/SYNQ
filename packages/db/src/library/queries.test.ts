import assert from "node:assert/strict";
import { before, describe, test } from "node:test";

import type { LibraryDb } from "../client.ts";
import {
  artworkPath,
  artworkUri,
  getArtistDetail,
  getSong,
  getSongItems,
  listAlbums,
  listAlbumTracks,
  listArtists,
  listPlaylists,
  listPlaylistSongs,
  listSongs,
  searchLibrary,
} from "../index.ts";
import { openMigratedLibrary } from "../testing/migrated-library.ts";
import { COVER_MTIMES } from "../testing/synthetic-install.ts";

function ids(items: readonly { id: number }[]) {
  return items.map((item) => item.id);
}

let db: LibraryDb;
before(async () => {
  db = await openMigratedLibrary();
});

void describe("songs", () => {
  void test("default order is newest first (2.5.2's date-added order)", () => {
    assert.deepEqual(
      ids(listSongs(db)),
      [16, 15, 14, 12, 10, 8, 7, 6, 5, 4, 3, 2, 1],
    );
    assert.deepEqual(
      ids(listSongs(db, { sort: "addedAt", order: "asc" })),
      [1, 2, 3, 4, 5, 6, 7, 8, 10, 12, 14, 15, 16],
    );
  });

  void test("sorts by title with locale collation (case and accents fold, ties by id)", () => {
    assert.deepEqual(
      ids(listSongs(db, { sort: "title", order: "asc" })),
      [2, 6, 14, 5, 7, 10, 15, 8, 3, 4, 16, 1, 12],
    );
  });

  void test("sorts by first artist, songs without artists last", () => {
    assert.deepEqual(
      ids(listSongs(db, { sort: "artist", order: "asc" })),
      [5, 3, 4, 2, 1, 12, 6, 14, 7, 10, 15, 8, 16],
    );
  });

  void test("sorts by primary album then track", () => {
    assert.deepEqual(
      ids(listSongs(db, { sort: "album", order: "asc" })).slice(0, 6),
      [16, 1, 2, 5, 3, 6],
    );
  });

  void test("searches title, artists, and albums; every term must match; accent-insensitive", () => {
    assert.deepEqual(ids(listSongs(db, { search: "kali" })), [2, 1]);
    assert.deepEqual(ids(listSongs(db, { search: "storm KALI" })), [2]);
    assert.deepEqual(ids(listSongs(db, { search: "cafe" })), [6]);
    assert.deepEqual(ids(listSongs(db, { search: "flower" })), [1]);
    assert.deepEqual(ids(listSongs(db, { search: "駆け" })), [12]);
  });

  void test("song detail: credits in order, artwork from the first album that has some", () => {
    const song = getSong(db, 2);
    assert.ok(song);
    assert.deepEqual(song.artists, [{ id: 2, name: "Kali Uchis" }]);
    assert.deepEqual(
      song.albums.map((a) => [a.id, a.name, a.track]),
      [
        [2, "Isolation", 3],
        [6, "Compilation", 9],
      ],
    );
    // Isolation has no cover, so Compilation's wins (2.5.2's precedence).
    assert.deepEqual(song.artwork, {
      kind: "album",
      id: 6,
      version: COVER_MTIMES.album6 * 1000,
    });
    assert.equal(song.liked, false);
    assert.deepEqual(song.playlistIds, [3]);
  });

  void test("song artwork falls back to the song's own cover, then to none", () => {
    assert.deepEqual(getSong(db, 3)?.artwork, {
      kind: "song",
      id: 3,
      version: COVER_MTIMES.song3 * 1000,
    });
    assert.equal(getSong(db, 4)?.artwork, null);
    assert.equal(getSong(db, 3)?.liked, true);
    assert.equal(getSong(db, 999), null);
  });

  void test("loads songs by id in one pass, skipping missing and repeated ids", () => {
    assert.deepEqual(ids(getSongItems(db, [5, 2, 999, 5, 12])), [2, 5, 12]);
    const [item] = getSongItems(db, [2]);
    const {
      liked: _liked,
      playlistIds: _playlistIds,
      ...detail
    } = getSong(db, 2) ?? {};
    assert.deepEqual(item, detail);
    assert.deepEqual(getSongItems(db, []), []);
  });

  void test("artwork paths and URIs are relative to Documents and cache-busted", () => {
    const ref = { kind: "album", id: 6, version: 5 } as const;
    assert.equal(artworkPath(ref, "small"), "albums/6/cover_small.jpg");
    assert.equal(
      artworkUri("file:///docs/", ref, "full"),
      "file:///docs/albums/6/cover_full.jpg?v=5",
    );
  });
});

void describe("playlists", () => {
  void test("Liked Songs first, with counts and total duration", () => {
    assert.deepEqual(
      listPlaylists(db).map((p) => [
        p.id,
        p.name,
        p.kind,
        p.songCount,
        p.durationMs,
      ]),
      [
        [2, "Favs ♥", "liked", 3, 632_000],
        [5, "Gym & Run", "user", 2, 100_000],
        [3, "Road Trip", "user", 4, 688_000],
      ],
    );
    assert.deepEqual(
      ids(listPlaylists(db, { sort: "name", order: "asc" })),
      [2, 5, 3],
    );
    assert.deepEqual(ids(listPlaylists(db, { search: "road" })), [3]);
  });

  void test("playlist songs in position order, reversible, sortable, searchable", () => {
    assert.deepEqual(ids(listPlaylistSongs(db, 3)), [2, 1, 6, 7]);
    assert.deepEqual(
      ids(listPlaylistSongs(db, 3, { order: "desc" })),
      [7, 6, 1, 2],
    );
    assert.deepEqual(
      ids(listPlaylistSongs(db, 3, { sort: "title" })),
      [2, 6, 7, 1],
    );
    assert.deepEqual(ids(listPlaylistSongs(db, 3, { search: "ghost" })), [7]);
    assert.deepEqual(
      listPlaylistSongs(db, 2).map((s) => [s.id, s.position]),
      [
        [3, 1],
        [1, 2],
        [5, 3],
      ],
    );
  });
});

void describe("albums", () => {
  void test("sorted by name or year, with artists and counts", () => {
    assert.deepEqual(ids(listAlbums(db)), [6, 5, 1, 2, 4, 3]);
    assert.deepEqual(ids(listAlbums(db, { sort: "year" })), [4, 1, 2, 6, 5, 3]);
    const flowerBoy = listAlbums(db).find((a) => a.id === 1);
    assert.deepEqual(flowerBoy?.artists, [
      { id: 1, name: "Tyler, The Creator" },
      { id: 2, name: "Kali Uchis" },
    ]);
    assert.equal(flowerBoy.songCount, 1);
    assert.equal(listAlbums(db).find((a) => a.id === 5)?.songCount, 0);
  });

  void test("search matches album name, artists, year, and song titles", () => {
    assert.deepEqual(ids(listAlbums(db, { search: "2016" })), [4]);
    assert.deepEqual(ids(listAlbums(db, { search: "formation" })), [4]);
    assert.deepEqual(ids(listAlbums(db, { search: "kali" })), [6, 1, 2]);
  });

  void test("tracks in track order", () => {
    assert.deepEqual(
      listAlbumTracks(db, 2).map((s) => [s.id, s.track]),
      [[2, 3]],
    );
    assert.deepEqual(ids(listAlbumTracks(db, 1)), [1]);
  });
});

void describe("artists", () => {
  void test("case-variant artists stay separate; counts include albums", () => {
    assert.deepEqual(
      listArtists(db).map((a) => [a.id, a.name, a.songCount, a.albumCount]),
      [
        [5, "Beyoncé", 1, 1],
        [3, "BTS", 1, 1],
        [4, "bts", 1, 0],
        [6, "Empty Artist", 0, 0],
        [2, "Kali Uchis", 2, 3],
        [1, "Tyler, The Creator", 1, 1],
        [7, "YOASOBI", 1, 0],
      ],
    );
  });

  void test("artist detail lists songs (newest first) and albums", () => {
    const detail = getArtistDetail(db, 2);
    assert.ok(detail);
    assert.deepEqual(ids(detail.songs), [2, 1]);
    assert.deepEqual(ids(detail.albums), [6, 1, 2]);
    assert.equal(getArtistDetail(db, 999), null);
  });
});

void describe("global search", () => {
  void test("searches every kind", () => {
    const results = searchLibrary(db, "kali");
    assert.deepEqual(ids(results.songs), [2, 1]);
    assert.deepEqual(ids(results.albums), [6, 1, 2]);
    assert.deepEqual(ids(results.artists), [2]);
    assert.deepEqual(results.playlists, []);
    assert.deepEqual(ids(searchLibrary(db, "gym").playlists), [5]);
    assert.deepEqual(searchLibrary(db, "  "), {
      songs: [],
      albums: [],
      artists: [],
      playlists: [],
    });
  });
});
