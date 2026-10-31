/**
 * `@synq/db/expo`: the app-side wiring (expo-sqlite + expo-file-system).
 * Kept out of the main entry so node tests never load native modules.
 */
import { drizzle } from "drizzle-orm/expo-sqlite";
import { migrate } from "drizzle-orm/expo-sqlite/migrator";
import { Directory, File, Paths } from "expo-file-system";
import { openDatabaseAsync, openDatabaseSync, type SQLiteDatabase } from "expo-sqlite";

import type { LibraryDb } from "./client.ts";
import { LEGACY_DB_PATH } from "./legacy/index.ts";
import type { LegacyDatabase, LegacyTextFileSystem } from "./legacy/types.ts";
import { libraryMigrations } from "./migrations.ts";
import * as schema from "./schema.ts";

/** `Documents/SQLite/library.db` (expo-sqlite's default directory is `Documents/SQLite`). */
export const LIBRARY_DB_NAME = "library.db";

/**
 * Opens library.db with foreign keys on (cascades depend on it; it is a
 * per-connection setting) and WAL. Call `migrateLibraryDb` before any query.
 */
export function openLibraryDb(): { db: LibraryDb; client: SQLiteDatabase } {
  const client = openDatabaseSync(LIBRARY_DB_NAME);
  client.execSync("PRAGMA journal_mode = WAL; PRAGMA foreign_keys = ON;");
  return { db: drizzle(client, { schema }) as unknown as LibraryDb, client };
}

/** Applies the bundled Drizzle migrations (no babel or Metro configuration needed). */
export async function migrateLibraryDb(db: LibraryDb): Promise<void> {
  await migrate(db as never, libraryMigrations);
}

/** Whether `Documents/SQLite/synq.db` (a 2.5.2 install) exists. */
export function hasLegacyDatabase(): boolean {
  return new File(Paths.document, LEGACY_DB_PATH).exists;
}

/**
 * Copies the legacy database (with its `-wal`/`-shm` files, which may hold
 * 2.5.2's last committed writes) into the cache and opens the copy, so not
 * even a WAL checkpoint touches the user's `synq.db`. Close it when done.
 */
export async function openLegacyDatabaseCopy(sourceDir: Directory = new Directory(Paths.document, "SQLite")): Promise<{
  legacyDb: LegacyDatabase;
  close: () => Promise<void>;
}> {
  const copyDir = new Directory(Paths.cache, "legacy-import");
  if (copyDir.exists) copyDir.delete();
  copyDir.create({ intermediates: true });
  for (const suffix of ["", "-wal", "-shm"]) {
    const source = new File(sourceDir, `synq.db${suffix}`);
    if (source.exists) await source.copy(new File(copyDir, `synq.db${suffix}`));
  }
  // expo-sqlite wants a plain path (its default directory is one), not a file:// URI.
  const directory = decodeURIComponent(copyDir.uri.replace(/^file:\/\//, ""));
  const client = await openDatabaseAsync("synq.db", {}, directory);
  return {
    legacyDb: { all: (sql, params) => client.getAllAsync(sql, [...(params ?? [])]) },
    close: async () => {
      await client.closeAsync();
      copyDir.delete();
    },
  };
}

/**
 * A file inside `Documents/` from a stored relative path (`file_path`,
 * `artworkPath()`). Pass segments, never one concatenated string:
 * expo-file-system percent-encodes each segment it joins, but parses a single
 * string as a URL, so a 2.5.2 file named `Song #2 & more.m4a` would be cut
 * at the `#`.
 */
export function documentFile(relativePath: string): File {
  return new File(Paths.document, ...relativePath.split("/").filter(Boolean));
}

/** 2.5.2's AsyncStorage directory: `Library/Application Support/{bundleId}/RCTAsyncLocalStorage_V1`. */
export function legacyAsyncStorageDirectory(bundleId: string): Directory {
  // Documents/ and Library/ are siblings in the app's data container.
  return new Directory(Paths.document.parentDirectory, "Library", "Application Support", bundleId, "RCTAsyncLocalStorage_V1");
}

/**
 * `LegacyTextFileSystem` over expo-file-system. The importer builds paths as
 * `{root}/{name}/{name}...`; each must start with one of `roots`' URIs
 * (pass `Paths.document` or the extracted backup folder, and the AsyncStorage
 * directory), and the remainder is split into raw name segments so
 * expo-file-system encodes them (see `documentFile`).
 */
export function createExpoLegacyFileSystem(roots: readonly Directory[]): LegacyTextFileSystem {
  const bases = roots.map((dir) => ({ dir, prefix: dir.uri.replace(/\/+$/, "") }));
  const resolve = (path: string): [Directory, string[]] => {
    const base = bases.find(({ prefix }) => path === prefix || path.startsWith(`${prefix}/`));
    if (!base) throw new Error(`Path outside the import roots: ${path}`);
    return [base.dir, path.slice(base.prefix.length).split("/").filter(Boolean)];
  };
  const asDirectory = (path: string) => {
    const [dir, segments] = resolve(path);
    return segments.length === 0 ? dir : new Directory(dir, ...segments);
  };
  const asFile = (path: string) => {
    const [dir, segments] = resolve(path);
    return new File(dir, ...segments);
  };
  return {
    exists: (path) => asDirectory(path).exists || asFile(path).exists,
    list: (path) => {
      const dir = asDirectory(path);
      return dir.exists ? dir.list().map((entry) => entry.name) : [];
    },
    stat: (path) => {
      const dir = asDirectory(path);
      if (dir.exists) return { isDirectory: true, size: 0, modifiedMs: dir.info().modificationTime ?? null };
      const file = asFile(path);
      if (!file.exists) return null;
      const info = file.info();
      return { isDirectory: false, size: info.size ?? 0, modifiedMs: info.modificationTime ?? null };
    },
    readText: async (path) => {
      const file = asFile(path);
      return file.exists ? file.text() : null;
    },
  };
}
