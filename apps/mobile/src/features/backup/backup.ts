import { listContents, subscribe, unzip, zip } from "react-native-zip-archive";
import Constants from "expo-constants";
import { Directory, File, Paths } from "expo-file-system";
import * as Sharing from "expo-sharing";

import { ensureLikedPlaylist } from "@synq/db";
import {
  createExpoLegacyFileSystem,
  openLegacyDatabaseCopy,
} from "@synq/db/expo";
import { findLegacyBackupRoot, importLegacyLibrary } from "@synq/db/legacy";

import { libraryDb } from "~/features/library/database";
import { synqMedia } from "~/features/media/native";
import { queryClient } from "~/lib/query-client";
import {
  BACKUP_FORMAT,
  BACKUP_VERSION,
  backupKind,
  LIBRARY_FOLDERS,
  manifestFrom,
} from "./manifest";
import {
  countRows,
  RestoreError,
  restoreRows,
  sqlString,
  TABLES,
} from "./restore-rows";

export { RestoreError } from "./restore-rows";

/**
 * Backup & Restore. A backup is a zip of a consistent copy of
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

/** Builds a backup and shares it. Resolves once the share sheet closes. */
export async function backUpLibrary(onProgress: (fraction: number) => void) {
  resetWork();
  const date = new Date().toISOString().slice(0, 10);
  const staging = new Directory(WORK, "staging");
  staging.create({ intermediates: true });
  const db = libraryDb();
  // A consistent snapshot, whatever the WAL holds, without pausing writes.
  db.run(`VACUUM INTO ${sqlString(pathOf(new File(staging, "library.db")))}`);
  await Promise.all(
    LIBRARY_FOLDERS.map((name) => new Directory(Paths.document, name))
      .filter((folder) => folder.exists)
      .map((folder) =>
        synqMedia().linkTree(
          folder.uri,
          new Directory(staging, folder.name).uri,
        ),
      ),
  );
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

/**
 * Moves the backup's media folders into Documents in place of the
 * library's (the database already points at them). Safe to run again if
 * it fails partway.
 */
async function replaceFolders(root: Directory) {
  const trash = new Directory(WORK, "previous");
  trash.create({ idempotent: true, intermediates: true });
  await Promise.all(
    LIBRARY_FOLDERS.map(async (name) => {
      const incoming = new Directory(root, name);
      const current = new Directory(Paths.document, name);
      if (current.exists) await current.move(new Directory(trash, name));
      // A backup without the folder (an empty library) leaves none.
      if (incoming.exists)
        await incoming.move(new Directory(Paths.document, name));
    }),
  );
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
  await Promise.all(
    LIBRARY_FOLDERS.map((name) => new Directory(Paths.document, name))
      .filter((folder) => folder.exists)
      .map((folder) => folder.move(new Directory(WORK, folder.name))),
  );
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
