/**
 * `@synq/db/expo`: the app-side wiring (expo-sqlite + expo-file-system).
 * Kept out of the main entry so node tests never load native modules.
 */
import type { ExpoSQLiteDatabase } from "drizzle-orm/expo-sqlite";
import { Directory, File, Paths } from "expo-file-system";
import { openDatabaseAsync, openDatabaseSync } from "expo-sqlite";
import { drizzle } from "drizzle-orm/expo-sqlite";
import { migrate } from "drizzle-orm/expo-sqlite/migrator";

import type { LibrarySchema } from "./client.ts";
import type { LegacyDatabase, LegacyTextFileSystem } from "./legacy/types.ts";
import { LEGACY_DB_PATH } from "./legacy/index.ts";
import { encodedPath } from "./library/file-uri.ts";
import { libraryMigrations } from "./migrations.ts";
import * as schema from "./schema.ts";

/** `Documents/SQLite/library.db` (expo-sqlite's default directory is `Documents/SQLite`). */
export const LIBRARY_DB_NAME = "library.db";

/**
 * Opens library.db with foreign keys on (cascades depend on it; it is a
 * per-connection setting) and WAL. Call `migrateLibraryDb` before any query.
 */
export function openLibraryDb() {
  const client = openDatabaseSync(LIBRARY_DB_NAME);
  client.execSync("PRAGMA journal_mode = WAL; PRAGMA foreign_keys = ON;");
  return { db: drizzle(client, { schema }), client };
}

/**
 * Opens a `library.db` in another folder: a backup's, or an empty one to
 * import a 2.5.2 backup into. Call `migrateLibraryDb` before reading it.
 */
export function openLibraryDbIn(directory: Directory) {
  // expo-sqlite wants a plain path (its default directory is one), not a file:// URI.
  const path = decodeURIComponent(directory.uri.replace(/^file:\/\//, ""));
  const client = openDatabaseSync(LIBRARY_DB_NAME, {}, path);
  client.execSync("PRAGMA foreign_keys = ON;");
  return { close: () => client.closeSync(), db: drizzle(client, { schema }) };
}

/** Applies the bundled Drizzle migrations (no babel or Metro configuration needed). */
export async function migrateLibraryDb(db: ExpoSQLiteDatabase<LibrarySchema>) {
  await migrate(db, libraryMigrations);
}

/** Whether `Documents/SQLite/synq.db` (a 2.5.2 install) exists. */
export function hasLegacyDatabase() {
  return documentFile(LEGACY_DB_PATH).exists;
}

/**
 * Copies the legacy database (with its `-wal`/`-shm` files, which may hold
 * 2.5.2's last committed writes) into the cache and opens the copy, so not
 * even a WAL checkpoint touches the user's `synq.db`. Close it when done.
 */
export async function openLegacyDatabaseCopy(
  sourceDir: Directory = new Directory(Paths.document, "SQLite"),
) {
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
    legacyDb: {
      all: (sql, params) => client.getAllAsync(sql, [...(params ?? [])]),
    } satisfies LegacyDatabase,
    close: async () => {
      await client.closeAsync();
      copyDir.delete();
    },
  };
}

/**
 * A file inside `Documents/` from a stored relative path (`file_path`,
 * `artworkPath()`). The URI is encoded here, every segment, and handed over
 * whole. Don't pass names as segments to `new File(dir, name)`: its join encodes
 * only some characters, and a name with `[` then comes out encoded twice (`%2520`),
 * which is a file that doesn't exist. 2.5.2 kept people's file names as they were,
 * so `Song #2 [live] é & more.m4a` is what a real library looks like.
 */
export function documentFile(relativePath: string) {
  return fileIn(Paths.document, relativePath);
}

/** The base's URI with a relative path after it, every segment encoded. */
function uriIn(base: Directory, relativePath: string) {
  return `${base.uri.replace(/\/?$/, "/")}${encodedPath(relativePath)}`;
}

/** A file under a directory, from a relative path (see `documentFile`). */
export function fileIn(base: Directory, relativePath: string) {
  return new File(uriIn(base, relativePath));
}

/** A directory under a directory, from a relative path (see `documentFile`). */
export function directoryIn(base: Directory, relativePath: string) {
  return new Directory(uriIn(base, relativePath));
}

/** 2.5.2's AsyncStorage directory: `Library/Application Support/{bundleId}/RCTAsyncLocalStorage_V1`. */
export function legacyAsyncStorageDirectory(bundleId: string) {
  // Documents/ and Library/ are siblings in the app's data container.
  return new Directory(
    Paths.document.parentDirectory,
    "Library",
    "Application Support",
    bundleId,
    "RCTAsyncLocalStorage_V1",
  );
}

/**
 * `LegacyTextFileSystem` over expo-file-system. The importer builds paths as
 * `{root}/{name}/{name}...`; each must start with one of `roots`' URIs
 * (pass `Paths.document` or the extracted backup folder, and the AsyncStorage
 * directory), and the remainder is encoded by name (see `documentFile`).
 */
export function createExpoLegacyFileSystem(roots: readonly Directory[]) {
  const bases = roots.map((dir) => ({
    dir,
    prefix: dir.uri.replace(/\/+$/, ""),
  }));
  function resolve(path: string) {
    const base = bases.find(
      ({ prefix }) => path === prefix || path.startsWith(`${prefix}/`),
    );
    if (!base) throw new Error(`Path outside the import roots: ${path}`);
    return [
      base.dir,
      path.slice(base.prefix.length).split("/").filter(Boolean),
    ] as const;
  }
  function asDirectory(path: string) {
    const [dir, segments] = resolve(path);
    return segments.length === 0 ? dir : directoryIn(dir, segments.join("/"));
  }
  function asFile(path: string) {
    const [dir, segments] = resolve(path);
    return fileIn(dir, segments.join("/"));
  }
  return {
    exists: (path) => asDirectory(path).exists || asFile(path).exists,
    list: (path) => {
      const dir = asDirectory(path);
      return dir.exists ? dir.list().map((entry) => entry.name) : [];
    },
    stat: (path) => {
      const dir = asDirectory(path);
      if (dir.exists)
        return {
          isDirectory: true,
          size: 0,
          modifiedMs: dir.info().modificationTime ?? null,
        };
      const file = asFile(path);
      if (!file.exists) return null;
      const info = file.info();
      return {
        isDirectory: false,
        size: info.size ?? 0,
        modifiedMs: info.modificationTime ?? null,
      };
    },
    readText: async (path) => {
      const file = asFile(path);
      return file.exists ? file.text() : null;
    },
  } satisfies LegacyTextFileSystem;
}
