import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { dirname, join } from "node:path";
import { test } from "node:test";
import { fileURLToPath } from "node:url";

import { sql } from "drizzle-orm";

import { libraryMigrations } from "./migrations.ts";
import { openTestLibraryDb } from "./testing/node-sqlite.ts";

const packageDir = join(dirname(fileURLToPath(import.meta.url)), "..");

test("src/migrations.ts matches drizzle/ (run `pnpm db:generate` after schema changes)", () => {
  execFileSync(process.execPath, [join(packageDir, "scripts", "bundle-migrations.ts"), "--check"], { stdio: "pipe" });
  assert.ok(libraryMigrations.journal.entries.length > 0);
});

test("migrations apply through drizzle's expo-sqlite migrator and are re-runnable", async () => {
  const { db, client } = await openTestLibraryDb();
  const { migrate } = await import("drizzle-orm/expo-sqlite/migrator");
  await migrate(db as never, libraryMigrations);
  const tables = db
    .all<{ name: string }>(sql`SELECT name FROM sqlite_master WHERE type = 'table' AND name NOT LIKE 'sqlite_%' ORDER BY name`)
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
  assert.equal(db.all(sql`SELECT * FROM __drizzle_migrations`).length, libraryMigrations.journal.entries.length);
  client.closeSync();
});
