/** Use Album Artwork, and what can and can't change an album's cover (docs/rewrite.md → Song artwork). */
import assert from "node:assert/strict";
import { beforeEach, describe, test } from "node:test";
import { eq, sql } from "drizzle-orm";
import { migrate } from "drizzle-orm/expo-sqlite/migrator";

import type { LibraryDb } from "../client.ts";
import {
  addSongs,
  coverAlbum,
  deleteSongs,
  editSong,
  getAlbum,
  getSong,
  listSongs,
  setArtwork,
} from "../index.ts";
import { libraryMigrations } from "../migrations.ts";
import { songs } from "../schema.ts";
import { library, merge } from "../testing/merge-fixture.ts";
import { openMigratedLibrary } from "../testing/migrated-library.ts";
import { openTestLibraryDb } from "../testing/node-sqlite.ts";
import { NOW } from "../testing/write-test-helpers.ts";

const ALBUM_COVER = NOW + 1;
const SONG_COVER = NOW + 2;
const OTHER_COVER = NOW + 3;

/** Two songs on an album with a cover; the first also has its own artwork. */
function albumWithCover(db: LibraryDb) {
  const [first, second] = addSongs(
    db,
    [
      { album: "Shared", durationMs: 1000, fileName: "a.mp3", title: "First" },
      { album: "Shared", durationMs: 1000, fileName: "b.mp3", title: "Second" },
    ],
    { now: NOW },
  ).value;
  if (first?.albumId == null || second === undefined)
    throw new Error("Not added");
  const albumId = first.albumId;
  setArtwork(
    db,
    { id: albumId, kind: "album", present: true },
    { now: ALBUM_COVER },
  );
  setArtwork(
    db,
    { id: first.id, kind: "song", present: true },
    { now: SONG_COVER },
  );
  return { albumId, first: first.id, second: second.id };
}

function shown(db: LibraryDb, id: number) {
  return getSong(db, id)?.artwork ?? null;
}

let db: LibraryDb;
beforeEach(async () => {
  db = await openMigratedLibrary();
});

void describe("a 2.5.2 library, just upgraded", () => {
  void test("every song uses its album's artwork, and shows 2.5.2's precedence", () => {
    const all = listSongs(db);
    assert.ok(all.length > 0);
    let album = 0;
    let own = 0;
    for (const song of all) {
      assert.equal(song.useAlbumArtwork, true);
      const cover = song.albums.find((item) => item.artworkVersion !== null);
      if (cover !== undefined) {
        album += 1;
        assert.deepEqual(song.artwork, {
          id: cover.id,
          kind: "album",
          version: cover.artworkVersion,
        });
      } else {
        if (song.ownArtwork !== null) own += 1;
        assert.deepEqual(song.artwork, song.ownArtwork);
      }
    }
    // The fixture has both, or this test proves nothing.
    assert.ok(album > 0);
    assert.ok(own > 0);
  });

  void test("the migration turns the switch on for songs already in library.db", async () => {
    const { db: fresh } = await openTestLibraryDb(":memory:", {
      ...libraryMigrations,
      journal: {
        // Everything before the migration that added the column.
        entries: libraryMigrations.journal.entries.filter(
          (entry) => entry.idx < 2,
        ),
      },
    });
    fresh.run(
      sql`INSERT INTO songs (id, title, added_at) VALUES (1, 'Before', ${NOW})`,
    );
    await migrate(fresh, libraryMigrations);
    const [row] = fresh.select().from(songs).where(eq(songs.id, 1)).all();
    assert.equal(row?.useAlbumArtwork, true);
  });
});

void describe("the switch", () => {
  void test("on, a song shows its album's cover over its own", () => {
    const { albumId, first } = albumWithCover(db);
    assert.deepEqual(shown(db, first), {
      id: albumId,
      kind: "album",
      version: ALBUM_COVER,
    });
  });

  void test("off, it shows its own, and on again the album's, with its own kept", () => {
    const { albumId, first } = albumWithCover(db);
    editSong(db, first, { useAlbumArtwork: false });
    assert.deepEqual(shown(db, first), {
      id: first,
      kind: "song",
      version: SONG_COVER,
    });
    editSong(db, first, { useAlbumArtwork: true });
    assert.equal(shown(db, first)?.kind, "album");
    assert.equal(shown(db, first)?.id, albumId);
    assert.equal(getSong(db, first)?.ownArtwork?.version, SONG_COVER);
  });

  void test("off with no artwork of its own, it shows the placeholder", () => {
    const { second } = albumWithCover(db);
    editSong(db, second, { useAlbumArtwork: false });
    assert.equal(shown(db, second), null);
  });

  void test("on an album with no cover, it falls back to its own", () => {
    const { albumId, first } = albumWithCover(db);
    setArtwork(db, { id: albumId, kind: "album", present: false });
    assert.equal(shown(db, first)?.kind, "song");
  });

  void test("an edit that doesn't mention it leaves it", () => {
    const { first } = albumWithCover(db);
    editSong(db, first, { useAlbumArtwork: false });
    editSong(db, first, { title: "Renamed" });
    assert.equal(getSong(db, first)?.useAlbumArtwork, false);
  });

  void test("turning it off marks the song modified, since its export changes", () => {
    const { first } = albumWithCover(db);
    db.update(songs).set({ modifiedSinceExport: false }).run();
    editSong(db, first, { useAlbumArtwork: false });
    assert.equal(getSong(db, first)?.modifiedSinceExport, true);
  });
});

void describe("an album's cover", () => {
  void test("reaches the songs using it, and not one that opted out", () => {
    const { albumId, first, second } = albumWithCover(db);
    editSong(db, first, { useAlbumArtwork: false });
    setArtwork(
      db,
      { id: albumId, kind: "album", present: true },
      { now: OTHER_COVER },
    );
    assert.equal(shown(db, second)?.version, OTHER_COVER);
    assert.equal(shown(db, first)?.version, SONG_COVER);
  });

  void test("survives deleting one of its songs", () => {
    const { albumId, first, second } = albumWithCover(db);
    const deleted = deleteSongs(db, [second]).value;
    assert.deepEqual(deleted.deletePaths, [`library/${String(second)}`]);
    assert.equal(getAlbum(db, albumId)?.artwork?.version, ALBUM_COVER);
    assert.equal(shown(db, first)?.kind, "album");
  });

  void test("survives removing a song's own artwork", () => {
    const { albumId, first, second } = albumWithCover(db);
    editSong(db, first, { useAlbumArtwork: false });
    setArtwork(db, { id: first, kind: "song", present: false });
    assert.equal(getAlbum(db, albumId)?.artwork?.version, ALBUM_COVER);
    assert.equal(shown(db, first), null);
    assert.equal(shown(db, second)?.kind, "album");
  });
});

void describe("coverAlbum", () => {
  const without = { artworkVersion: null, id: 1 };
  const withCover = { artworkVersion: 5, id: 2 };

  void test("is the first with a cover, else the primary, else none", () => {
    assert.equal(coverAlbum([without, withCover]), withCover);
    assert.equal(coverAlbum([without]), without);
    assert.equal(coverAlbum([]), undefined);
  });
});

void describe("restoring a backup", () => {
  void test("a new song keeps its setting; one on both sides keeps this library's", async () => {
    const current = await library();
    current.song(1, "Both", "both");
    const backup = await library();
    backup.song(1, "Both", "both");
    backup.song(2, "New", "new");
    editSong(backup.db, 1, { useAlbumArtwork: false });
    editSong(backup.db, 2, { useAlbumArtwork: false });
    await merge(current, backup);
    const byTitle = new Map(
      listSongs(current.db).map((song) => [song.title, song.useAlbumArtwork]),
    );
    assert.equal(byTitle.get("Both"), true);
    assert.equal(byTitle.get("New"), false);
  });
});
