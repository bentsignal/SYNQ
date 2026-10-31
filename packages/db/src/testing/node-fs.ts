/** `LegacyTextFileSystem` over `node:fs`, for tests and fixture tooling. */
import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";

import type { LegacyDatabase, LegacyTextFileSystem } from "../legacy/types.ts";
import { DatabaseSync } from "node:sqlite";

export const nodeFileSystem: LegacyTextFileSystem = {
  exists: (path) => existsSync(path),
  list: (path) => {
    try {
      return readdirSync(path);
    } catch {
      return [];
    }
  },
  stat: (path) => {
    try {
      const stat = statSync(path);
      return { isDirectory: stat.isDirectory(), size: stat.size, modifiedMs: Math.round(stat.mtimeMs) };
    } catch {
      return null;
    }
  },
  readText: (path) => (existsSync(path) ? readFileSync(path, "utf8") : null),
};

/** Opens a legacy database file read-only, as the importer's `LegacyDatabase`. */
export function openLegacyDatabaseFile(path: string): { legacyDb: LegacyDatabase; close: () => void } {
  const raw = new DatabaseSync(path, { readOnly: true });
  return {
    legacyDb: {
      all: (sql, params = []) => raw.prepare(sql).all(...params).map((row) => ({ ...row })),
    },
    close: () => raw.close(),
  };
}
