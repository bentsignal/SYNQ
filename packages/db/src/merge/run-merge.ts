/**
 * Restoring a backup: merges a library (the backup's, already read) into
 * the current one, adding what's missing and replacing nothing. See
 * docs/rewrite.md → Restoring a backup.
 *
 * Files go first, then one transaction. Until it commits the database knows
 * nothing about them, so a failure, or the app being killed, leaves the
 * library as it was, and the journal says which files to clear away.
 */
import { sql } from "drizzle-orm";

import type { LibraryDb } from "../client.ts";
import type { MergePlan } from "./plan-merge.ts";
import type {
  LibrarySnapshot,
  MergeFileSystem,
  MergeJournal,
  MergeJournalStore,
} from "./types.ts";
import {
  commitMerge,
  committedMergeToken,
  reserveMergeIds,
} from "./commit-merge.ts";
import { indexPaths } from "./file-index.ts";
import { matchSongs } from "./match-songs.ts";
import { isEmptyPlan, lastIds, planMerge } from "./plan-merge.ts";
import { readLibrarySnapshot } from "./snapshot.ts";

/** The share of the merge's progress spent comparing files, before moving them. */
const COMPARING_SHARE = 0.9;

/** A 31-bit token, for `PRAGMA user_version`. Never 0, the column's default. */
function tokenFrom(now: number) {
  return now % 0x7fffffff || 1;
}

interface MergeOptions {
  db: LibraryDb;
  backup: LibrarySnapshot;
  fs: MergeFileSystem;
  journal: MergeJournalStore;
  onProgress?: (fraction: number) => void;
  /** Called between files, to let the UI run if it's been waiting. */
  pause?: () => Promise<void>;
  now?: number;
}

function sequences(db: LibraryDb) {
  const rows = db.all<{ name: string; seq: number }>(
    sql`SELECT name, seq FROM sqlite_sequence`,
  );
  function seq(name: string) {
    return rows.find((row) => row.name === name)?.seq;
  }
  return {
    albums: seq("albums"),
    artists: seq("artists"),
    playlists: seq("playlists"),
    songs: seq("songs"),
  };
}

function undo(fs: MergeFileSystem, journal: MergeJournal) {
  for (const path of journal.files) fs.removeFile(path);
  for (const path of journal.folders) fs.removeFolder(path);
}

/** Adds a backup to the library. Throws with the library as it was. */
export async function mergeBackup(options: MergeOptions) {
  const { backup, db, fs, journal, onProgress, pause } = options;
  const now = options.now ?? Date.now();
  const current = readLibrarySnapshot(db);
  const matches = await matchSongs({
    backup,
    current,
    fs,
    onProgress: (fraction) => onProgress?.(fraction * COMPARING_SHARE),
    pause,
  });

  const paths = await indexPaths({
    backup,
    current,
    lastIds: lastIds(current, sequences(db)),
    fs,
    pause,
  });

  // Planned and reserved without yielding, so nothing can write in between.
  const plan = planMerge({
    backup,
    current: readLibrarySnapshot(db),
    fs: paths,
    matches,
    sequences: sequences(db),
  });
  if (isEmptyPlan(plan)) return plan.summary;
  reserveMergeIds(db, plan);

  const entry = {
    files: plan.addedFiles,
    folders: plan.newFolders,
    token: tokenFrom(now),
  };
  journal.write(entry);
  try {
    await moveFiles(plan, fs, onProgress, pause);
    commitMerge(db, plan, entry.token, now);
  } catch (error) {
    undo(fs, entry);
    journal.clear();
    throw error;
  }
  journal.clear();
  onProgress?.(1);
  return plan.summary;
}

async function moveFiles(
  plan: MergePlan,
  fs: MergeFileSystem,
  onProgress: MergeOptions["onProgress"],
  pause: MergeOptions["pause"],
) {
  for (const [index, { from, to }] of plan.moves.entries()) {
    await fs.move(from, to);
    onProgress?.(
      COMPARING_SHARE + (1 - COMPARING_SHARE) * (index / plan.moves.length),
    );
    await pause?.();
  }
}

/**
 * Clears up after a merge the app didn't live to finish: if its transaction
 * never committed, the files it moved go. Call it when the library opens,
 * before anything reads it.
 */
export function recoverInterruptedMerge(
  db: LibraryDb,
  fs: Pick<MergeFileSystem, "removeFile" | "removeFolder">,
  journal: MergeJournalStore,
) {
  const entry = journal.read();
  if (entry === null) return;
  if (committedMergeToken(db) !== entry.token) {
    for (const path of entry.files) fs.removeFile(path);
    for (const path of entry.folders) fs.removeFolder(path);
  }
  journal.clear();
}
