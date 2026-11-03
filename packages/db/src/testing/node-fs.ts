/** `LegacyTextFileSystem` over `node:fs`, for tests and fixture tooling. */
import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { DatabaseSync } from "node:sqlite";

import type { LegacyDatabase, LegacyTextFileSystem } from "../legacy/types.ts";

export const nodeFileSystem = {
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
      return {
        isDirectory: stat.isDirectory(),
        size: stat.size,
        modifiedMs: Math.round(stat.mtimeMs),
      };
    } catch {
      return null;
    }
  },
  readText: (path) => (existsSync(path) ? readFileSync(path, "utf8") : null),
} satisfies LegacyTextFileSystem;

/** Opens a legacy database file read-only, as the importer's `LegacyDatabase`. */
export function openLegacyDatabaseFile(path: string) {
  const raw = new DatabaseSync(path, { readOnly: true });
  return {
    legacyDb: {
      all: (sql, params = []) =>
        raw
          .prepare(sql)
          .all(...params)
          .map((row) => ({ ...row })),
    } satisfies LegacyDatabase,
    close: () => raw.close(),
  };
}
