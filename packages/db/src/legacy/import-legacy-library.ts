/**
 * Imports a 2.5.2 library (an upgraded install or a 2.5.2 backup zip) into
 * library.db. See `docs/migration.md` for the full mapping and the app-side
 * contract. Guarantees:
 *
 * - Reads only: the legacy database through `LegacyDatabase`, the folders
 *   through `LegacyFileSystem`. Nothing legacy is written, moved, or deleted.
 * - All-or-nothing: every row, plus the `legacy_import` record, is written in
 *   one transaction that verifies its own row counts and foreign keys before
 *   committing. Any failure rolls back and the next launch retries.
 * - Idempotent: once a `legacy_import` row exists, it returns
 *   `already-imported` without touching anything.
 * - Ids are preserved, so `library/{id}/` and the cover folders stay valid,
 *   and `sqlite_sequence` is carried over so no 2.5.2 id is ever reissued.
 */
import { desc } from "drizzle-orm";

import type { LibraryDb } from "../client.ts";
import type { LegacyImportCounts, LegacyImportSource } from "../schema.ts";
import type { LegacyAsyncStorage } from "./async-storage.ts";
import type { ImportPlan } from "./plan-import.ts";
import type { LegacySettings } from "./settings.ts";
import type {
  LegacyDatabase,
  LegacyFileSystem,
  LegacyImportWarning,
} from "./types.ts";
import { legacyImport } from "../schema.ts";
import { planImport } from "./plan-import.ts";
import { readLegacyDatabase } from "./read-legacy-db.ts";
import { scanFolders } from "./scan-files.ts";
import { parseLegacySettings } from "./settings.ts";
import {
  assertTargetEmpty,
  carrySequences,
  insertPlan,
  verify,
} from "./write-import.ts";

export {
  LegacyImportError,
  type LegacyImportErrorCode,
} from "./import-error.ts";

export type LegacyImportStep =
  | "reading-database"
  | "scanning-files"
  | "writing"
  | "verifying"
  | "committed";

export interface ImportLegacyLibraryOptions {
  /** The 2.5.2 database, opened read-only (or a copy of it). */
  legacyDb: LegacyDatabase;
  /** library.db, migrated. */
  targetDb: LibraryDb;
  fs: LegacyFileSystem;
  /**
   * The folder holding `SQLite/`, `library/`, `albums/`, `artists/`,
   * `playlists/`: the app's `Documents/` on upgrade, or the extracted backup.
   */
  root: string;
  source: LegacyImportSource;
  /** From `readLegacyAsyncStorage`; omit for backups (they have none). */
  asyncStorage?: LegacyAsyncStorage | null;
  now?: number;
  /** Progress for a splash screen; throwing from it aborts (and rolls back) the import. */
  onProgress?: (step: LegacyImportStep) => void;
}

export type LegacyImportResult =
  | {
      status: "imported";
      importId: number;
      counts: LegacyImportCounts;
      /** Null when there was no AsyncStorage (backups, or a never-configured install). */
      settings: LegacySettings | null;
      warnings: LegacyImportWarning[];
    }
  | {
      status: "already-imported";
      importId: number;
      importedAt: number;
      settings: LegacySettings | null;
    };

/** The completed import, if any (its `settings` let the app re-apply preferences idempotently). */
export function getLegacyImport(db: LibraryDb) {
  return (
    db
      .select()
      .from(legacyImport)
      .orderBy(desc(legacyImport.id))
      .limit(1)
      .get() ?? null
  );
}

export async function importLegacyLibrary(options: ImportLegacyLibraryOptions) {
  const { targetDb: db } = options;
  const now = options.now ?? Date.now();
  const root = options.root.replace(/\/+$/, "");

  const previous = getLegacyImport(db);
  if (previous) return alreadyImported(previous);
  assertTargetEmpty(db, false);

  const warnings = new Array<LegacyImportWarning>();
  options.onProgress?.("reading-database");
  const snapshot = await readLegacyDatabase(options.legacyDb, warnings);
  options.onProgress?.("scanning-files");
  const scan = await scanFolders(options.fs, root);
  const plan = planImport(snapshot, scan, now, warnings);
  const settings = settingsFor(options.asyncStorage ?? null, plan, warnings);

  const outcome = db.transaction((tx): LegacyImportResult => {
    // Re-checked inside the transaction in case two imports raced.
    const raced = getLegacyImport(tx);
    if (raced) return alreadyImported(raced);
    assertTargetEmpty(tx, true);
    return writeImport(tx, {
      options,
      plan,
      sequences: snapshot.sequences,
      settings,
      warnings,
      now,
    });
  });
  options.onProgress?.("committed");
  return outcome;
}

/** The preferences AsyncStorage held, and a warning for any of it that couldn't be read. */
function settingsFor(
  asyncStorage: LegacyAsyncStorage | null,
  plan: ImportPlan,
  warnings: LegacyImportWarning[],
) {
  if (!asyncStorage) return null;
  if (asyncStorage.problems.length > 0) {
    warnings.push({
      code: "async-storage",
      message: asyncStorage.problems.join("; "),
    });
  }
  return parseLegacySettings(asyncStorage.values, {
    songIds: new Set(plan.songs.map((s) => s.id)),
    playlistIds: new Set(plan.playlists.map((p) => p.id)),
    albumIds: new Set(plan.albums.map((a) => a.id)),
    artistIds: new Set(plan.artists.map((a) => a.id)),
  });
}

function writeImport(
  tx: LibraryDb,
  write: {
    options: ImportLegacyLibraryOptions;
    plan: ImportPlan;
    sequences: Record<string, number>;
    settings: LegacySettings | null;
    warnings: LegacyImportWarning[];
    now: number;
  },
) {
  const { options, plan, sequences, settings, warnings, now } = write;
  const counts = {
    songs: plan.songs.length,
    artists: plan.artists.length,
    albums: plan.albums.length,
    playlists: plan.playlists.length,
    songArtists: plan.songArtists.length,
    albumSongs: plan.albumSongs.length,
    albumArtists: plan.albumArtists.length,
    playlistSongs: plan.playlistSongs.length,
  };

  options.onProgress?.("writing");
  insertPlan(tx, plan);
  carrySequences(tx, sequences);

  options.onProgress?.("verifying");
  verify(tx, counts);

  const { id } = tx
    .insert(legacyImport)
    .values({
      source: options.source,
      importedAt: now,
      legacyDbVersion: settings?.bookkeeping.legacyDbVersion ?? null,
      counts,
      settings,
      warnings,
    })
    .returning({ id: legacyImport.id })
    .get();
  return {
    status: "imported" as const,
    importId: id,
    counts,
    settings,
    warnings,
  };
}

function alreadyImported(row: typeof legacyImport.$inferSelect) {
  return {
    status: "already-imported" as const,
    importId: row.id,
    importedAt: row.importedAt,
    settings: row.settings ?? null,
  };
}
