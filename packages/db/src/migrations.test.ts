import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { dirname, join } from "node:path";
import { test } from "node:test";
import { fileURLToPath } from "node:url";
import { sql } from "drizzle-orm";

import { libraryMigrations } from "./migrations.ts";
import { openTestLibraryDb } from "./testing/node-sqlite.ts";

const packageDir = join(dirname(fileURLToPath(import.meta.url)), "..");

void test("src/migrations.ts matches drizzle/ (run `pnpm db:generate` after schema changes)", () => {
  execFileSync(
    process.execPath,
    [join(packageDir, "scripts", "bundle-migrations.ts"), "--check"],
    { stdio: "pipe" },
  );
  assert.ok(libraryMigrations.journal.entries.length > 0);
});

void test("migrations apply through drizzle's expo-sqlite migrator and are re-runnable", async () => {
  const { db, client } = await openTestLibraryDb();
  const { migrate } = await import("drizzle-orm/expo-sqlite/migrator");
  await migrate(db, libraryMigrations);
  const tables = db
    .all<{
      name: string;
    }>(
      sql`SELECT name FROM sqlite_master WHERE type = 'table' AND name NOT LIKE 'sqlite_%' ORDER BY name`,
    )
    .map((row) => row.name);
  assert.deepEqual(tables, [
    "__drizzle_migrations",
    "album_artists",
    "album_songs",
    "albums",
    "artists",
    "legacy_import",
    "playlist_songs",
    "playlists",
    "song_artists",
    "songs",
  ]);
  assert.equal(
    db.all(sql`SELECT * FROM __drizzle_migrations`).length,
    libraryMigrations.journal.entries.length,
  );
  client.closeSync();
});

void test("0003 keeps one album per song: the first with a cover, else the first", async () => {
  const before = libraryMigrations.journal.entries.filter(
    (entry) => entry.tag < "0003",
  );
  const { db, client } = await openTestLibraryDb(":memory:", {
    ...libraryMigrations,
    journal: { ...libraryMigrations.journal, entries: before },
  });
  const { migrate } = await import("drizzle-orm/expo-sqlite/migrator");
  // Albums 1 and 4 have no cover; 2 and 3 do.
  db.run(sql`INSERT INTO albums (id, name, artwork_version, added_at) VALUES
    (1, 'A', NULL, 0), (2, 'B', 5, 0), (3, 'C', 6, 0), (4, 'D', NULL, 0)`);
  db.run(sql`INSERT INTO songs (id, title, added_at) VALUES
    (1, 'one', 0), (2, 'two', 0), (3, 'three', 0), (4, 'four', 0)`);
  db.run(sql`INSERT INTO album_songs (album_id, song_id, track, position) VALUES
    (1, 1, 1, 0), (2, 1, 7, 1), (3, 1, 2, 2),
    (1, 2, 2, 0), (4, 2, 3, 1),
    (2, 3, 4, 0), (1, 3, 5, 1),
    (3, 4, 9, 0)`);

  await migrate(db, libraryMigrations);

  assert.deepEqual(
    db.all(
      sql`SELECT song_id AS songId, album_id AS albumId, track, position FROM album_songs ORDER BY song_id`,
    ),
    [
      { songId: 1, albumId: 2, track: 7, position: 0 },
      { songId: 2, albumId: 1, track: 2, position: 0 },
      { songId: 3, albumId: 2, track: 4, position: 0 },
      { songId: 4, albumId: 3, track: 9, position: 0 },
    ],
  );
  // Album D lost its only song and stays, empty, like any album an edit empties.
  assert.equal(db.all(sql`SELECT id FROM albums`).length, 4);
  assert.throws(() =>
    db.run(
      sql`INSERT INTO album_songs (album_id, song_id, track, position) VALUES (4, 1, NULL, 1)`,
    ),
  );
  client.closeSync();
});
