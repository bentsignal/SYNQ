import Constants from "expo-constants";
import { Directory, File, Paths } from "expo-file-system";
import * as Sharing from "expo-sharing";
import { listContents, subscribe, unzip, zip } from "react-native-zip-archive";

import type { LibraryDb } from "@synq/db";
import { ensureLikedPlaylist, libraryMigrations } from "@synq/db";
import {
  createExpoLegacyFileSystem,
  openLegacyDatabaseCopy,
} from "@synq/db/expo";
import { findLegacyBackupRoot, importLegacyLibrary } from "@synq/db/legacy";

import { libraryDb } from "~/features/library/database";
import { synqMedia } from "~/features/media/native";
import { queryClient } from "~/lib/query-client";
import {
  backupKind,
  BACKUP_FORMAT,
  BACKUP_VERSION,
  LIBRARY_FOLDERS,
  manifestFrom,
} from "./manifest";

/**
 * Backup & Restore (Premium). A backup is a zip of a consistent copy of
 * library.db, the library's media folders (`library/`, `albums/`,
 * `artists/`, `playlists/`), and a manifest. It's built in the cache and
 * handed to the share sheet, never left in Documents. Restore takes a 3.0
 * backup or a 2.5.2 one (a zip of its Documents, with `SQLite/synq.db`;
 * docs/migration.md) and replaces the library: the database first, in one
 * transaction, then the folders.
 */

const WORK = new Directory(Paths.cache, "backup");

/** A restore whose database is in place but whose folders aren't yet. */
let pendingFolders: Directory | undefined;

/** A file:// URI as the path react-native-zip-archive and SQLite take. */
function pathOf(entry: File | Directory) {
  return decodeURIComponent(entry.uri.replace(/^file:\/\//, "")).replace(
    /\/$/,
    "",
  );
}

function sqlString(value: string) {
  return `'${value.replaceAll("'", "''")}'`;
}

function resetWork() {
  if (WORK.exists) WORK.delete();
  WORK.create({ intermediates: true });
}

function clearWork() {
  try {
    if (WORK.exists) WORK.delete();
  } catch {
    // Only cache.
  }
}

/** Zip progress (0 to 1) while `run` runs. */
async function withZipProgress<Value>(
  onProgress: (fraction: number) => void,
  run: () => Promise<Value>,
) {
  const subscription = subscribe(({ progress }) => onProgress(progress));
  return run().then(
    (value) => {
      subscription.remove();
      return value;
    },
    (error: unknown) => {
      subscription.remove();
      throw error;
    },
  );
}

function countRows(db: LibraryDb, table: string) {
  const row = db.get<{ n: number }>(`SELECT count(*) AS n FROM ${table}`);
  return row.n;
}

/** Builds a backup and shares it. Resolves once the share sheet closes. */
export async function backUpLibrary(onProgress: (fraction: number) => void) {
  resetWork();
  const date = new Date().toISOString().slice(0, 10);
  const staging = new Directory(WORK, "staging");
  staging.create({ intermediates: true });
  const db = libraryDb();
  // A consistent snapshot, whatever the WAL holds, without pausing writes.
  db.run(`VACUUM INTO ${sqlString(pathOf(new File(staging, "library.db")))}`);
  for (const name of LIBRARY_FOLDERS) {
    const folder = new Directory(Paths.document, name);
    if (folder.exists) {
      await synqMedia().linkTree(folder.uri, new Directory(staging, name).uri);
    }
  }
  new File(staging, "manifest.json").write(
    JSON.stringify(
      {
        appVersion: Constants.expoConfig?.version ?? null,
        counts: {
          albums: countRows(db, "albums"),
          artists: countRows(db, "artists"),
          playlists: countRows(db, "playlists"),
          songs: countRows(db, "songs"),
        },
        createdAt: Date.now(),
        format: BACKUP_FORMAT,
        version: BACKUP_VERSION,
      },
      null,
      2,
    ),
  );
  const archive = new File(WORK, `SYNQ Backup ${date}.zip`);
  // Audio and JPEGs don't compress; storing keeps backups fast.
  await withZipProgress(onProgress, () =>
    zip(pathOf(staging), pathOf(archive), 0),
  );
  staging.delete();
  await Sharing.shareAsync(archive.uri, {
    mimeType: "application/zip",
    UTI: "public.zip-archive",
  });
  clearWork();
}

/** What a picked zip holds, from its table of contents (nothing extracted). */
export async function inspectBackup(uri: string) {
  const entries = await listContents(pathOf(new File(uri)));
  const kind = backupKind(entries.map((entry) => entry.path));
  const manifestPath = entries.find((entry) =>
    /(^|\/)manifest\.json$/.test(entry.path),
  );
  return { kind, hasManifest: manifestPath !== undefined };
}

/** The tables a 3.0 backup's rows replace, children last. */
const TABLES = [
  "artists",
  "albums",
  "songs",
  "playlists",
  "song_artists",
  "album_songs",
  "album_artists",
  "playlist_songs",
] as const;

function columns(db: LibraryDb, schemaName: string, table: string) {
  return db
    .all<{ name: string }>(`PRAGMA ${schemaName}.table_info(${table})`)
    .map((column) => column.name);
}

/**
 * Replaces the library's rows with a 3.0 backup's, in one transaction:
 * the columns both share, `sqlite_sequence` never lowered (so ids, and
 * the folders named by them, are never reissued), and this device's
 * record of its 2.5.2 import kept unless the backup has one, so the
 * importer never runs over a restored library.
 */
function restoreRows(db: LibraryDb, backupPath: string) {
  db.run(`ATTACH DATABASE ${sqlString(backupPath)} AS backup`);
  try {
    const newest = libraryMigrations.journal.entries.at(-1)?.when ?? 0;
    const backupNewest =
      db.get<{ when: number | null } | undefined>(
        "SELECT max(created_at) AS \"when\" FROM backup.__drizzle_migrations",
      )?.when ?? 0;
    if (backupNewest > newest) {
      throw new RestoreError("newer", "This backup is from a newer SYNQ.");
    }
    db.transaction((tx) => {
      for (const table of [...TABLES].reverse()) tx.run(`DELETE FROM main.${table}`);
      for (const table of TABLES) {
        const shared = columns(tx, "backup", table).filter((name) =>
          columns(tx, "main", table).includes(name),
        );
        if (shared.length === 0) continue;
        const list = shared.map((name) => `"${name}"`).join(", ");
        tx.run(
          `INSERT INTO main.${table} (${list}) SELECT ${list} FROM backup.${table}`,
        );
      }
      if (countRows(tx, "backup.legacy_import") > 0) {
        tx.run("DELETE FROM main.legacy_import");
        const list = columns(tx, "backup", "legacy_import")
          .filter((name) => columns(tx, "main", "legacy_import").includes(name))
          .map((name) => `"${name}"`)
          .join(", ");
        tx.run(
          `INSERT INTO main.legacy_import (${list}) SELECT ${list} FROM backup.legacy_import`,
        );
      }
      tx.run(
        `UPDATE main.sqlite_sequence SET seq = max(seq, coalesce((SELECT b.seq FROM backup.sqlite_sequence b WHERE b.name = main.sqlite_sequence.name), 0))`,
      );
    });
  } catch (error) {
    db.run("DETACH DATABASE backup");
    throw error;
  }
  db.run("DETACH DATABASE backup");
}

export class RestoreError extends Error {
  readonly code: "newer" | "not-a-backup" | "files";

  constructor(code: RestoreError["code"], message: string) {
    super(message);
    this.code = code;
  }
}

/**
 * Moves the backup's media folders into Documents in place of the
 * library's (the database already points at them). Safe to run again if
 * it fails partway.
 */
async function replaceFolders(root: Directory) {
  const trash = new Directory(WORK, "previous");
  trash.create({ idempotent: true, intermediates: true });
  for (const name of LIBRARY_FOLDERS) {
    const incoming = new Directory(root, name);
    const current = new Directory(Paths.document, name);
    if (!incoming.exists) {
      // The backup had none (an empty library): the library has none either.
      if (current.exists) await current.move(new Directory(trash, name));
      continue;
    }
    if (current.exists) await current.move(new Directory(trash, name));
    await incoming.move(new Directory(Paths.document, name));
  }
}

/** Finds a 3.0 backup's root: the extraction folder or one level down. */
function findManifestRoot(extracted: Directory) {
  if (new File(extracted, "manifest.json").exists) return extracted;
  for (const entry of extracted.list()) {
    if (
      entry instanceof Directory &&
      !entry.name.startsWith(".") &&
      new File(entry, "manifest.json").exists
    ) {
      return entry;
    }
  }
  return null;
}

/**
 * Restores a picked backup over the library. `onProgress` reports
 * extraction. Throws `RestoreError` for a file that isn't a SYNQ backup.
 */
export async function restoreLibrary(
  uri: string,
  onProgress: (fraction: number) => void,
) {
  pendingFolders = undefined;
  resetWork();
  const extracted = new Directory(WORK, "extracted");
  extracted.create({ intermediates: true });
  await withZipProgress(onProgress, () =>
    unzip(pathOf(new File(uri)), pathOf(extracted)),
  );
  const db = libraryDb();
  let root = findManifestRoot(extracted);
  if (root !== null) {
    const manifest = manifestFrom(
      JSON.parse(new File(root, "manifest.json").textSync()),
    );
    if (manifest === null) {
      throw new RestoreError("not-a-backup", "Not a SYNQ backup.");
    }
    if (manifest.version > BACKUP_VERSION) {
      throw new RestoreError("newer", "This backup is from a newer SYNQ.");
    }
    restoreRows(db, pathOf(new File(root, "library.db")));
  } else {
    const fs = createExpoLegacyFileSystem([extracted]);
    const legacyRoot = await findLegacyBackupRoot(
      fs,
      extracted.uri.replace(/\/$/, ""),
    );
    if (legacyRoot === null) {
      throw new RestoreError("not-a-backup", "Not a SYNQ backup.");
    }
    root = new Directory(legacyRoot);
    const legacy = await openLegacyDatabaseCopy(new Directory(root, "SQLite"));
    await importLegacyLibrary({
      asyncStorage: null,
      fs,
      legacyDb: legacy.legacyDb,
      replaceExisting: true,
      root: legacyRoot,
      source: "backup",
      targetDb: db,
    }).then(legacy.close, async (error: unknown) => {
      await legacy.close();
      throw error;
    });
  }
  ensureLikedPlaylist(db);
  libraryReplaced();
  pendingFolders = root;
  await finishRestore();
}

/**
 * Moves a restored backup's folders into place; after a `files` error,
 * Try Again calls it again.
 */
export async function finishRestore() {
  if (pendingFolders === undefined) return;
  try {
    await replaceFolders(pendingFolders);
  } catch {
    throw new RestoreError("files", "The library's files couldn't be moved.");
  }
  pendingFolders = undefined;
  clearWork();
}

/** Deletes every song, album, artist, and playlist, and their files. */
export async function eraseLibrary() {
  const db = libraryDb();
  db.transaction((tx) => {
    // The record of a 2.5.2 import stays, so it never runs again.
    for (const table of [...TABLES].reverse()) tx.run(`DELETE FROM ${table}`);
  });
  ensureLikedPlaylist(db);
  libraryReplaced();
  resetWork();
  for (const name of LIBRARY_FOLDERS) {
    const folder = new Directory(Paths.document, name);
    if (folder.exists) await folder.move(new Directory(WORK, name));
  }
  clearWork();
}

const replacedListeners = new Set<() => void>();

/**
 * Calls `listener` after a restore or erase replaced the whole library
 * (the player clears its queue). Returns an unsubscribe.
 */
export function onLibraryReplaced(listener: () => void) {
  replacedListeners.add(listener);
  return () => {
    replacedListeners.delete(listener);
  };
}

function libraryReplaced() {
  void queryClient.invalidateQueries({ queryKey: ["library"] });
  for (const listener of replacedListeners) listener();
}
