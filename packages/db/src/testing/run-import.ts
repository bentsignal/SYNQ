import { createHash } from "node:crypto";
import { readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";

import type { ImportLegacyLibraryOptions } from "../legacy/index.ts";
import type { SyntheticInstall } from "./synthetic-install.ts";
import {
  importLegacyLibrary,
  readLegacyAsyncStorage,
} from "../legacy/index.ts";
import { nodeFileSystem, openLegacyDatabaseFile } from "./node-fs.ts";
import { openTestLibraryDb } from "./node-sqlite.ts";

export const NOW = 1_800_000_000_000;
export function ms(seconds: number) {
  return seconds * 1000;
}

export async function runImport(
  install: SyntheticInstall,
  overrides: Partial<ImportLegacyLibraryOptions> = {},
) {
  const target = overrides.targetDb
    ? { db: overrides.targetDb }
    : await openTestLibraryDb();
  const legacy = openLegacyDatabaseFile(install.dbPath);
  try {
    const result = await importLegacyLibrary({
      legacyDb: legacy.legacyDb,
      targetDb: target.db,
      fs: nodeFileSystem,
      root: install.documents,
      source: "install",
      asyncStorage: await readLegacyAsyncStorage(
        install.asyncStorageDir,
        nodeFileSystem,
      ),
      now: NOW,
      ...overrides,
    });
    return { db: target.db, result };
  } finally {
    legacy.close();
  }
}

/** Content hash of every file under a directory, to prove the import wrote nothing. */
export function hashTree(dir: string) {
  const result = new Map<string, string>();
  function walk(current: string) {
    for (const name of readdirSync(current)) {
      const path = join(current, name);
      if (statSync(path).isDirectory()) walk(path);
      else
        result.set(
          path.slice(dir.length),
          createHash("sha256").update(readFileSync(path)).digest("hex"),
        );
    }
  }
  walk(dir);
  return Object.fromEntries(result);
}
