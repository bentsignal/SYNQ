import type { LegacySnapshot } from "./read-legacy-db.ts";
import type { FolderScan } from "./scan-files.ts";
import type { LegacyImportWarning } from "./types.ts";

/** 2.5.2's hidden playlist holding every song; the library itself in 3.0. */
export const LEGACY_LIBRARY_PLAYLIST_ID = 1;
/** 2.5.2's Liked Songs playlist, identified by id (users can rename it). */
export const LEGACY_LIKED_PLAYLIST_ID = 2;

export interface PlanContext {
  snapshot: LegacySnapshot;
  scan: FolderScan;
  now: number;
  warnings: LegacyImportWarning[];
}
