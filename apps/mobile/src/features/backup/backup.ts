import { listContents, subscribe, zip } from "react-native-zip-archive";
import Constants from "expo-constants";
import { Directory, File, Paths } from "expo-file-system";
import * as Sharing from "expo-sharing";

import type { LibraryDb } from "@synq/db";
import { ensureLikedPlaylist } from "@synq/db";

import { libraryDb } from "~/features/library/database";
import { synqMedia } from "~/features/media/native";
import { queryClient } from "~/lib/query-client";
import {
  BACKUP_FORMAT,
  BACKUP_VERSION,
  backupKind,
  LIBRARY_FOLDERS,
} from "./manifest";
import { clearWork, WORK } from "./restore-files";

/**
 * Backing up and erasing. A backup is a zip of a consistent copy of
 * library.db, the library's media folders (`library/`, `albums/`,
 * `artists/`, `playlists/`), and a manifest. It's built in the cache and
 * handed to the share sheet, never left in Documents. Restoring is in
 * `restore.ts`.
 */

/** The library's tables, parents first. */
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

function sqlString(value: string) {
  return `'${value.replaceAll("'", "''")}'`;
}

function countRows(db: LibraryDb, table: string) {
  return db.get<{ n: number }>(`SELECT count(*) AS n FROM ${table}`).n;
}

/** A file:// URI as the path react-native-zip-archive and SQLite take. */
export function pathOf(entry: File | Directory) {
  return decodeURIComponent(entry.uri.replace(/^file:\/\//, "")).replace(
    /\/$/,
    "",
  );
}

export function resetWork() {
  if (WORK.exists) WORK.delete();
  WORK.create({ intermediates: true });
}

/** Zip progress (0 to 1) while `run` runs. */
export async function withZipProgress<Value>(
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
  await clearWork();
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

/** Deletes every song, album, artist, and playlist, and their files. */
export async function eraseLibrary() {
  const db = libraryDb();
  db.transaction((tx) => {
    // The record of a 2.5.2 import stays, so it never runs again.
    for (const table of [...TABLES].reverse()) tx.run(`DELETE FROM ${table}`);
  });
  ensureLikedPlaylist(db);
  libraryErased();
  resetWork();
  await Promise.all(
    LIBRARY_FOLDERS.map((name) => new Directory(Paths.document, name))
      .filter((folder) => folder.exists)
      .map((folder) => folder.move(new Directory(WORK, folder.name))),
  );
  await clearWork();
}

const erasedListeners = new Set<() => void>();

/** Calls `listener` after the library is erased. Returns an unsubscribe. */
export function onLibraryErased(listener: () => void) {
  erasedListeners.add(listener);
  return () => {
    erasedListeners.delete(listener);
  };
}

function libraryErased() {
  void queryClient.invalidateQueries({ queryKey: ["library"] });
  for (const listener of erasedListeners) listener();
}
