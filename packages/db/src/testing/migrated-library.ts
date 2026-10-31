/** A library.db holding the synthetic 2.5.2 install, imported: realistic data for query tests. */
import { importLegacyLibrary } from "../legacy/import-legacy-library.ts";
import { nodeFileSystem, openLegacyDatabaseFile } from "./node-fs.ts";
import { openTestLibraryDb } from "./node-sqlite.ts";
import { buildSyntheticInstall } from "./synthetic-install.ts";

export const IMPORTED_AT = 1_800_000_000_000;

export async function openMigratedLibrary() {
  const install = buildSyntheticInstall();
  const { db } = await openTestLibraryDb();
  const legacy = openLegacyDatabaseFile(install.dbPath);
  try {
    await importLegacyLibrary({
      legacyDb: legacy.legacyDb,
      targetDb: db,
      fs: nodeFileSystem,
      root: install.documents,
      source: "install",
      now: IMPORTED_AT,
    });
  } finally {
    legacy.close();
  }
  return db;
}
