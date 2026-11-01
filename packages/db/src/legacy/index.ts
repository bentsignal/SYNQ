/**
 * `@synq/db/legacy`: importing a 2.5.2 library (an upgraded install or a
 * 2.5.2 backup zip). See `docs/migration.md`.
 */
import type { LegacyFileSystem } from "./types.ts";

export {
  LEGACY_ASYNC_STORAGE_DIR_NAME,
  LEGACY_ASYNC_STORAGE_KEY_FILES,
  readLegacyAsyncStorage,
  type LegacyAsyncStorage,
} from "./async-storage.ts";
export {
  getLegacyImport,
  importLegacyLibrary,
  LegacyImportError,
  type ImportLegacyLibraryOptions,
  type LegacyImportErrorCode,
  type LegacyImportResult,
  type LegacyImportStep,
} from "./import-legacy-library.ts";
export {
  parseLegacySettings,
  type LegacyLibraryIds,
  type LegacyPlaybackSession,
  type LegacyPlaybackSource,
  type LegacyRepeatMode,
  type LegacySettings,
} from "./settings.ts";
export type * from "./types.ts";

/** The 2.5.2 database, relative to `Documents/` (and to a backup's root). */
export const LEGACY_DB_PATH = "SQLite/synq.db";

/**
 * Finds the library root inside an extracted 2.5.2 backup zip: the folder
 * containing `SQLite/synq.db`, either the extraction folder itself (2.5.2's
 * zips) or one level down (a zip someone re-made from a folder). Null if
 * neither holds a 2.5.2 database.
 */
export async function findLegacyBackupRoot(
  fs: LegacyFileSystem,
  extractedDir: string,
) {
  const base = extractedDir.replace(/\/+$/, "");
  if (await fs.exists(`${base}/${LEGACY_DB_PATH}`)) return base;
  for (const name of await fs.list(base)) {
    if (name.startsWith(".") || name === "__MACOSX") continue;
    const candidate = `${base}/${name}`;
    if (await fs.exists(`${candidate}/${LEGACY_DB_PATH}`)) return candidate;
  }
  return null;
}
