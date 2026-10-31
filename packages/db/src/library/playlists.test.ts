import assert from "node:assert/strict";
import { beforeEach, describe, test } from "node:test";
import { eq } from "drizzle-orm";

import type { LibraryDb } from "../client.ts";
import {
  addSongsToPlaylist,
  createPlaylist,
  deletePlaylist,
  ensureLikedPlaylist,
  isSongLiked,
  listLikedSongIds,
  listPlaylistSongs,
  moveSongInPlaylist,
  removeSongsFromPlaylist,
  renamePlaylist,
  setPlaylistOrder,
  setSongLiked,
} from "../index.ts";
import { playlistSongs } from "../schema.ts";
import { openMigratedLibrary } from "../testing/migrated-library.ts";
import { openTestLibraryDb } from "../testing/node-sqlite.ts";
import { ids, libraryError, NOW } from "../testing/write-test-helpers.ts";

let db: LibraryDb;
beforeEach(async () => {
  db = await openMigratedLibrary();
});

void describe("likes and playlists", () => {
  void test("like appends to Liked Songs; unlike removes", () => {
    assert.equal(isSongLiked(db, 4), false);
    assert.deepEqual(setSongLiked(db, 4, true, { now: NOW }).changed, [
      "playlist_songs",
      "playlists",
    ]);
    assert.deepEqual(ids(listPlaylistSongs(db, 2)), [3, 1, 5, 4]);
    assert.equal(isSongLiked(db, 4), true);
    assert.deepEqual(setSongLiked(db, 4, true).changed, []);
    setSongLiked(db, 4, false);
    assert.deepEqual(ids(listPlaylistSongs(db, 2)), [3, 1, 5]);
  });

  void test("ensureLikedPlaylist creates Liked Songs once", async () => {
    const { db: empty } = await openTestLibraryDb();
    const first = ensureLikedPlaylist(empty, { now: NOW });
    assert.deepEqual(first.changed, ["playlists"]);
    assert.deepEqual(ensureLikedPlaylist(empty), {
      value: first.value,
      changed: [],
    });
    assert.equal(ensureLikedPlaylist(db).value, 2);
  });

  void test("create, rename, and delete playlists with name rules", () => {
    assert.throws(
      () => createPlaylist(db, " road TRIP "),
      libraryError("duplicate-name"),
    );
    assert.throws(() => createPlaylist(db, "   "), libraryError("empty-name"));
    const chill = createPlaylist(db, "  Chill  ", { now: NOW }).value;
    assert.deepEqual(
      [chill.name, chill.kind, chill.songCount, chill.createdAt],
      ["Chill", "user", 0, NOW],
    );
    assert.equal(renamePlaylist(db, 2, "Liked").value.name, "Liked");
    assert.equal(renamePlaylist(db, 3, "road trip").value.name, "road trip");
    assert.throws(() => deletePlaylist(db, 2), libraryError("liked-playlist"));
    assert.deepEqual(deletePlaylist(db, 3).value, {
      deletePaths: ["playlists/3"],
    });
    assert.deepEqual(
      db
        .select()
        .from(playlistSongs)
        .where(eq(playlistSongs.playlistId, 3))
        .all(),
      [],
    );
  });

  void test("add skips songs already present or missing; remove reports a count", () => {
    assert.deepEqual(addSongsToPlaylist(db, 3, [1, 4, 4, 999]).value, {
      added: [4],
      skipped: [1, 999],
    });
    assert.deepEqual(ids(listPlaylistSongs(db, 3)), [2, 1, 6, 7, 4]);
    assert.deepEqual(removeSongsFromPlaylist(db, 3, [1, 2]).value, {
      removed: 2,
    });
    assert.deepEqual(ids(listPlaylistSongs(db, 3)), [6, 7, 4]);
    assert.throws(
      () => addSongsToPlaylist(db, 999, [1]),
      libraryError("not-found"),
    );
  });
});

void describe("moving songs in a playlist", () => {
  void test("a move writes one row (the midpoint of its new neighbours)", () => {
    const before = listPlaylistSongs(db, 3).map((s) => [s.id, s.position]);
    assert.deepEqual(before, [
      [2, 1],
      [1, 2],
      [6, 3],
      [7, 4],
    ]);
    assert.equal(
      moveSongInPlaylist(db, { playlistId: 3, songId: 7, toIndex: 0 }).value
        .position,
      0,
    );
    assert.equal(
      moveSongInPlaylist(db, { playlistId: 3, songId: 2, toIndex: 2 }).value
        .position,
      2.5,
    );
    assert.deepEqual(
      listPlaylistSongs(db, 3).map((s) => [s.id, s.position]),
      [
        [7, 0],
        [1, 2],
        [2, 2.5],
        [6, 3],
      ],
    );
    assert.equal(
      moveSongInPlaylist(db, { playlistId: 3, songId: 6, toIndex: 99 }).value
        .position,
      3,
    );
    assert.throws(
      () => moveSongInPlaylist(db, { playlistId: 3, songId: 5, toIndex: 0 }),
      libraryError("not-found"),
    );
  });

  void test("renumbers when repeated moves exhaust the gap, keeping order and uniqueness", () => {
    // Keep dropping the last song between the first two: each move halves the gap.
    for (let i = 0; i < 80; i++) {
      const order = ids(listPlaylistSongs(db, 3));
      moveSongInPlaylist(db, {
        playlistId: 3,
        songId: order[order.length - 1] ?? 0,
        toIndex: 1,
      });
    }
    const entries = listPlaylistSongs(db, 3);
    assert.equal(entries.length, 4);
    assert.equal(new Set(entries.map((e) => e.position)).size, 4);
    const positions = entries.map((e) => e.position);
    assert.deepEqual(
      [...positions].sort((a, b) => a - b),
      positions,
    );
  });

  void test("liked song ids, without loading the songs", () => {
    const liked = listPlaylistSongs(db, 2).map((song) => song.id);
    assert.deepEqual(
      listLikedSongIds(db),
      [...liked].sort((a, b) => a - b),
    );
  });

  void test("sets a whole new order in one write, keeping unlisted songs after", () => {
    const before = ids(listPlaylistSongs(db, 3));
    const [first, second, ...rest] = before;
    if (first === undefined || second === undefined)
      throw new Error("fixture playlist 3 needs two songs");
    setPlaylistOrder(db, 3, [second, 999, second, first]);
    assert.deepEqual(ids(listPlaylistSongs(db, 3)), [second, first, ...rest]);
    assert.deepEqual(
      listPlaylistSongs(db, 3).map((song) => song.position),
      before.map((_, index) => index + 1),
    );
    assert.throws(
      () => setPlaylistOrder(db, 999, [1]),
      libraryError("not-found"),
    );
  });
});
