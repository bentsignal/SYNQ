/**
 * `@synq/db/merge`: restoring a backup by merging it into the library. See
 * docs/rewrite.md → Restoring a backup.
 */
export type {
  LibrarySnapshot,
  MergeFileSystem,
  MergeJournal,
  MergeJournalStore,
  MergeSide,
  MergeSummary,
} from "./types.ts";
export { mergeBackup, recoverInterruptedMerge } from "./run-merge.ts";
export { isNewerLibrarySchema, readLibrarySnapshot } from "./snapshot.ts";
