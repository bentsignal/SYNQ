import { Paths } from "expo-file-system";

import type { LibraryDb } from "@synq/db";
import type { LegacySettings } from "@synq/db/legacy";
import { ensureLikedPlaylist } from "@synq/db";
import {
  createExpoLegacyFileSystem,
  hasLegacyDatabase,
  legacyAsyncStorageDirectory,
  migrateLibraryDb,
  openLegacyDatabaseCopy,
  openLibraryDb,
} from "@synq/db/expo";
import {
  getLegacyImport,
  importLegacyLibrary,
  readLegacyAsyncStorage,
} from "@synq/db/legacy";

import { applyLegacySettings } from "./legacy-settings";

/** 2.5.2's bundle id, which owns the AsyncStorage folder the importer reads. */
const LEGACY_BUNDLE_ID = "com.directedbyshawn.synq";

let current: LibraryDb | undefined;
let currentClient: ReturnType<typeof openLibraryDb>["client"] | undefined;

/**
 * The open library database. Only screens behind the startup gate
 * (`useLibraryStartup`) call it, so it's always open by then.
 */
export function libraryDb() {
  if (current === undefined) throw new Error("The library isn't open yet.");
  return current;
}

/**
 * The open database's expo-sqlite connection, for development tools that
 * need SQL the library API doesn't offer (the dev seed). Never for features.
 */
export function libraryClientForDev() {
  if (currentClient === undefined)
    throw new Error("The library isn't open yet.");
  return currentClient;
}

/** Imports a 2.5.2 install's library and settings into the empty 3.0 one. */
async function importLegacyInstall(db: LibraryDb) {
  const asyncStorageDir = legacyAsyncStorageDirectory(LEGACY_BUNDLE_ID);
  const fs = createExpoLegacyFileSystem([Paths.document, asyncStorageDir]);
  const legacy = await openLegacyDatabaseCopy();
  const imported = importLegacyLibrary({
    asyncStorage: await readLegacyAsyncStorage(asyncStorageDir.uri, fs),
    fs,
    legacyDb: legacy.legacyDb,
    root: Paths.document.uri,
    source: "install",
    targetDb: db,
  });
  // The copy is closed and deleted whether or not the import worked.
  await imported.then(legacy.close, async (error: unknown) => {
    await legacy.close();
    throw error;
  });
}

/**
 * Opens the library: Drizzle migrations, then (once, on the first launch
 * after updating from 2.5.2) the legacy import, then the 2.5.2 settings
 * applied to this app's stores. The import is one transaction and leaves
 * 2.5.2's files untouched, so a failure here retries cleanly next time.
 * Settings are applied from the import's own record, so a crash between
 * the import and applying them can't lose them.
 */
export async function openLibrary() {
  const { client, db } = openLibraryDb();
  await migrateLibraryDb(db);
  if (hasLegacyDatabase() && getLegacyImport(db) === null) {
    await importLegacyInstall(db);
  }
  const imported = getLegacyImport(db);
  if (imported !== null && imported.source === "install") {
    applyLegacySettings(imported.id, legacySettingsFrom(imported.settings));
  }
  ensureLikedPlaylist(db);
  current = db;
  currentClient = client;
  return true;
}

/** The import record's settings column, which the importer wrote from `LegacySettings`. */
function legacySettingsFrom(stored: unknown) {
  if (typeof stored !== "object" || stored === null) return null;
  // eslint-disable-next-line @typescript-eslint/consistent-type-assertions -- The importer wrote this column from its typed LegacySettings; @synq/db types the JSON column as unknown.
  return stored as LegacySettings;
}
