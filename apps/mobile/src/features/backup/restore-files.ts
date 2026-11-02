import { Directory, File, Paths } from "expo-file-system";
import { deleteAsync } from "expo-file-system/legacy";

import type { LibraryDb } from "@synq/db";
import type {
  MergeFileSystem,
  MergeJournal,
  MergeJournalStore,
  MergeSide,
} from "@synq/db/merge";
import { recoverInterruptedMerge } from "@synq/db/merge";

import { readJson, removeKey, writeJson } from "~/lib/kv";

const JOURNAL_KEY = "restoreJournal";

/** Where backups are built and unpacked. */
export const WORK = new Directory(Paths.cache, "backup");

/** Off the JS thread, since a restore can leave thousands of files here. */
export async function clearWork() {
  await deleteAsync(WORK.uri, { idempotent: true }).catch(() => {
    // Only cache.
  });
}

function isStrings(value: unknown): value is string[] {
  return (
    Array.isArray(value) && value.every((item) => typeof item === "string")
  );
}

function isJournal(value: unknown): value is MergeJournal {
  return (
    typeof value === "object" &&
    value !== null &&
    typeof Reflect.get(value, "token") === "number" &&
    isStrings(Reflect.get(value, "files")) &&
    isStrings(Reflect.get(value, "folders"))
  );
}

function journalFrom(stored: unknown) {
  return isJournal(stored) ? stored : null;
}

/** In the kv-store, so it outlasts the app being killed mid-restore. */
export const restoreJournal = {
  clear: () => {
    removeKey(JOURNAL_KEY);
  },
  read: () => readJson(JOURNAL_KEY, journalFrom),
  write: (journal: MergeJournal) => {
    writeJson(JOURNAL_KEY, journal);
  },
} satisfies MergeJournalStore;

function segments(path: string) {
  return path.split("/").filter(Boolean);
}

function libraryFile(path: string) {
  return new File(Paths.document, ...segments(path));
}

function libraryFolder(path: string) {
  return new Directory(Paths.document, ...segments(path));
}

/** The last segment of an entry's file:// URI, with the exact bytes on disk. */
function nameFrom(uri: string) {
  const parts = uri.replace(/\/$/, "").split("/");
  return decodeURIComponent(parts.at(-1) ?? "");
}

function removeFile(path: string) {
  const file = libraryFile(path);
  if (file.exists) file.delete();
}

function removeFolder(path: string) {
  const folder = libraryFolder(path);
  if (folder.exists) folder.delete();
}

/** A merge's files: a backup extracted to `root`, and the library in Documents. */
export function restoreFileSystem(root: Directory) {
  function fileOn(side: MergeSide, path: string) {
    return side === "backup"
      ? new File(root, ...segments(path))
      : libraryFile(path);
  }
  function folderOn(side: MergeSide, path: string) {
    return side === "backup"
      ? new Directory(root, ...segments(path))
      : libraryFolder(path);
  }
  return {
    list: (side, path) => {
      const folder = folderOn(side, path);
      if (!folder.exists) return null;
      // Plain records: `list()` wraps each entry in a native object.
      return folder.listAsRecords().map((entry) => ({
        isFolder: entry.isDirectory,
        name: nameFrom(entry.uri),
      }));
    },
    // `md5` reads in 64 KB chunks without holding the file in memory. It's
    // synchronous, one file at a time, and the merge pauses between files.
    hash: (side, path) => {
      const hash = fileOn(side, path).md5;
      if (hash === null) throw new Error("Couldn't read a song's file.");
      return Promise.resolve(hash);
    },
    move: async (fromBackup, toLibrary) => {
      const target = libraryFile(toLibrary);
      if (target.exists) throw new Error("A file is already there.");
      target.parentDirectory.create({ idempotent: true, intermediates: true });
      // Same volume as the cache, so this renames rather than copies.
      await new File(root, ...segments(fromBackup)).move(target);
    },
    removeFile,
    removeFolder,
    size: (side, path) => {
      const file = fileOn(side, path);
      return file.exists ? file.size : null;
    },
  } satisfies MergeFileSystem;
}

/**
 * Clears away a restore the app didn't live to finish. A failure here costs
 * only some stray files, so it never gets in the way of opening the library;
 * the journal stays, and the next launch tries again.
 */
export function recoverInterruptedRestore(db: LibraryDb) {
  void clearWork();
  try {
    recoverInterruptedMerge(db, { removeFile, removeFolder }, restoreJournal);
  } catch {
    // As above.
  }
}
