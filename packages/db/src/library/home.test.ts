/** The Library tab's home: Pinned and Recents (docs/rewrite.md → Home). */
import assert from "node:assert/strict";
import { beforeEach, describe, test } from "node:test";
import { eq, sql } from "drizzle-orm";
import { migrate } from "drizzle-orm/expo-sqlite/migrator";

import type { LibraryDb } from "../client.ts";
import type { HomeItem } from "./home.ts";
import {
  createPlaylist,
  deleteAlbum,
  deleteSongs,
  findLikedPlaylistId,
  listAlbums,
  listPinned,
  listRecents,
  listSongs,
  recordLikedPlayed,
  recordPlayed,
  setPinned,
} from "../index.ts";
import { libraryMigrations } from "../migrations.ts";
import { albums, artists, playlists, songs } from "../schema.ts";
import { library, merge, T } from "../testing/merge-fixture.ts";
import { openMigratedLibrary } from "../testing/migrated-library.ts";
import { openTestLibraryDb } from "../testing/node-sqlite.ts";
import { NOW } from "../testing/write-test-helpers.ts";

function keys(items: readonly HomeItem[]) {
  return items.map((item) => `${item.kind}:${String(item.id)}`);
}

function everything(db: LibraryDb) {
  return listRecents(db, { limit: 1000 }).items;
}

/** The first album with songs. */
function firstAlbum(db: LibraryDb) {
  const [album] = listAlbums(db).filter((item) => item.songCount > 0);
  if (album === undefined) throw new Error("No album with songs");
  return album;
}

let db: LibraryDb;
beforeEach(async () => {
  db = await openMigratedLibrary();
});

void describe("a 2.5.2 library, just upgraded", () => {
  void test("has nothing pinned or played, and still has a home", () => {
    for (const table of [albums, artists, playlists, songs]) {
      for (const row of db.select().from(table).all()) {
        assert.equal(row.lastPlayedAt, null);
        assert.equal(row.pinnedAt, null);
      }
    }
    assert.deepEqual(listPinned(db), []);
    const items = everything(db);
    assert.ok(items.length > 0);
    assert.ok(items.some((item) => item.kind === "album"));
  });

  void test("every song is reachable: its album stands for it, or it's there itself", () => {
    const items = everything(db);
    const shown = new Set(keys(items));
    for (const song of listSongs(db)) {
      const reachable =
        shown.has(`song:${String(song.id)}`) ||
        song.albums.some((album) => shown.has(`album:${String(album.id)}`));
      assert.ok(reachable, song.title);
    }
  });

  void test("artists and Liked Songs wait until they're played", () => {
    const items = everything(db);
    assert.ok(!items.some((item) => item.kind === "artist"));
    assert.ok(
      !items.some(
        (item) => item.kind === "playlist" && item.playlist.kind === "liked",
      ),
    );
  });
});

void describe("Recents", () => {
  void test("what was just played comes first, and moves when played again", () => {
    const album = firstAlbum(db);
    const [song] = listSongs(db);
    if (song === undefined) throw new Error("No songs");
    recordPlayed(db, { id: album.id, kind: "album" }, { now: NOW });
    assert.equal(keys(everything(db))[0], `album:${String(album.id)}`);
    recordPlayed(db, { id: song.id, kind: "song" }, { now: NOW + 1 });
    assert.deepEqual(keys(everything(db)).slice(0, 2), [
      `song:${String(song.id)}`,
      `album:${String(album.id)}`,
    ]);
    recordPlayed(db, { id: album.id, kind: "album" }, { now: NOW + 2 });
    assert.equal(keys(everything(db))[0], `album:${String(album.id)}`);
  });

  void test("a played artist and Liked Songs join in", () => {
    recordPlayed(db, { id: 1, kind: "artist" }, { now: NOW });
    assert.equal(keys(everything(db))[0], "artist:1");
    recordLikedPlayed(db, { now: NOW + 1 });
    assert.equal(
      keys(everything(db))[0],
      `playlist:${String(findLikedPlaylistId(db))}`,
    );
  });

  void test("a new playlist comes first without being played", () => {
    const playlist = createPlaylist(db, "Fresh", { now: NOW }).value;
    assert.equal(keys(everything(db))[0], `playlist:${String(playlist.id)}`);
  });

  void test("an album with no songs isn't shown", () => {
    const album = firstAlbum(db);
    db.run(sql`DELETE FROM album_songs WHERE album_id = ${album.id}`);
    assert.ok(!keys(everything(db)).includes(`album:${String(album.id)}`));
  });

  void test("pages line up, and hasMore ends on the last one", () => {
    const all = keys(everything(db));
    assert.ok(all.length > 3);
    const first = listRecents(db, { limit: 2 });
    assert.deepEqual(keys(first.items), all.slice(0, 2));
    assert.equal(first.hasMore, true);
    const more = listRecents(db, { limit: 4 });
    assert.deepEqual(keys(more.items), all.slice(0, 4));
    const last = listRecents(db, { limit: all.length + 1 });
    assert.deepEqual(keys(last.items), all);
    assert.equal(last.hasMore, false);
  });

  void test("deleted things go, whichever way they're deleted", () => {
    const album = firstAlbum(db);
    recordPlayed(db, { id: album.id, kind: "album" }, { now: NOW });
    setPinned(db, { id: album.id, kind: "album" }, true, { now: NOW });
    deleteAlbum(db, album.id);
    assert.deepEqual(listPinned(db), []);
    assert.ok(!keys(everything(db)).includes(`album:${String(album.id)}`));
    const [song] = listSongs(db);
    if (song === undefined) throw new Error("No songs");
    recordPlayed(db, { id: song.id, kind: "song" }, { now: NOW });
    deleteSongs(db, [song.id]);
    assert.ok(!keys(everything(db)).includes(`song:${String(song.id)}`));
  });
});

void describe("Pinned", () => {
  void test("any kind can be pinned, the latest first, with no limit", () => {
    const liked = findLikedPlaylistId(db);
    if (liked === null) throw new Error("No Liked Songs");
    const album = firstAlbum(db);
    const [song] = listSongs(db);
    if (song === undefined) throw new Error("No songs");
    setPinned(db, { id: album.id, kind: "album" }, true, { now: NOW });
    setPinned(db, { id: 1, kind: "artist" }, true, { now: NOW + 1 });
    setPinned(db, { id: liked, kind: "playlist" }, true, { now: NOW + 2 });
    setPinned(db, { id: song.id, kind: "song" }, true, { now: NOW + 3 });
    assert.deepEqual(keys(listPinned(db)), [
      `song:${String(song.id)}`,
      `playlist:${String(liked)}`,
      "artist:1",
      `album:${String(album.id)}`,
    ]);
  });

  void test("a pinned item leaves Recents, stays pinned when played, and returns where it belongs", () => {
    const album = firstAlbum(db);
    const ref = { id: album.id, kind: "album" } as const;
    const key = `album:${String(album.id)}`;
    setPinned(db, ref, true, { now: NOW });
    assert.ok(!keys(everything(db)).includes(key));
    recordPlayed(db, ref, { now: NOW + 1 });
    assert.deepEqual(keys(listPinned(db)), [key]);
    assert.ok(!keys(everything(db)).includes(key));
    setPinned(db, ref, false);
    assert.deepEqual(listPinned(db), []);
    assert.equal(keys(everything(db))[0], key);
  });

  void test("list items say whether they're pinned", () => {
    const album = firstAlbum(db);
    assert.equal(album.pinnedAt, null);
    setPinned(db, { id: album.id, kind: "album" }, true, { now: NOW });
    assert.equal(firstAlbum(db).pinnedAt, NOW);
  });

  void test("an album emptied after pinning stays, so it can be unpinned", () => {
    const album = firstAlbum(db);
    setPinned(db, { id: album.id, kind: "album" }, true, { now: NOW });
    db.run(sql`DELETE FROM album_songs WHERE album_id = ${album.id}`);
    assert.deepEqual(keys(listPinned(db)), [`album:${String(album.id)}`]);
  });
});

void describe("upgrading a database made before pins and plays", () => {
  void test("adds the columns, blank, and changes nothing else", async () => {
    const { journal, migrations } = libraryMigrations;
    const { client, db: fresh } = await openTestLibraryDb(":memory:", {
      journal: { entries: journal.entries.slice(0, 1) },
      migrations: { m0000: migrations.m0000 },
    });
    fresh.run(
      sql`INSERT INTO songs (id, title, added_at) VALUES (7, 'Kept', ${T})`,
    );
    fresh.run(
      sql`INSERT INTO albums (id, name, added_at) VALUES (3, 'Kept', ${T})`,
    );
    await migrate(fresh, libraryMigrations);
    const song = fresh.select().from(songs).where(eq(songs.id, 7)).get();
    assert.ok(song);
    assert.equal(song.title, "Kept");
    assert.equal(song.addedAt, T);
    assert.equal(song.lastPlayedAt, null);
    assert.equal(song.pinnedAt, null);
    const album = fresh.select().from(albums).where(eq(albums.id, 3)).get();
    assert.ok(album);
    assert.equal(album.name, "Kept");
    assert.equal(album.pinnedAt, null);
    client.closeSync();
  });
});

void describe("restoring a backup", () => {
  void test("what's new keeps its pin and plays; what's here keeps its own", async () => {
    const current = await library();
    current.song(1, "Here", "here");
    current.album(1, "Shared");
    current.track(1, 1, 1);
    const backup = await library();
    backup.song(1, "Here", "here");
    backup.song(2, "New Song", "new");
    backup.album(1, "Shared");
    backup.track(1, 1, 1);
    backup.album(2, "New Album");
    backup.track(2, 2, 1);
    backup.artist(1, "New Artist");
    backup.credit(2, 1);
    backup.playlist(1, "New Playlist", [2]);
    const time = { now: T + 5 };
    setPinned(backup.db, { id: 1, kind: "album" }, true, time);
    setPinned(backup.db, { id: 2, kind: "album" }, true, time);
    setPinned(backup.db, { id: 2, kind: "song" }, true, time);
    recordPlayed(backup.db, { id: 1, kind: "artist" }, time);
    setPinned(backup.db, { id: 1, kind: "playlist" }, true, time);
    await merge(current, backup);
    const pinned = listPinned(current.db).map((item) => {
      switch (item.kind) {
        case "album":
          return item.album.name;
        case "artist":
          return item.artist.name;
        case "playlist":
          return item.playlist.name;
        case "song":
          return item.song.title;
      }
    });
    assert.deepEqual(pinned.sort(), ["New Album", "New Playlist", "New Song"]);
    const [artist] = everything(current.db);
    assert.equal(artist?.kind, "artist");
  });
});
