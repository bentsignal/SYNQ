/** What a 3.0 backup zip holds besides `library.db`: its manifest's shape. */
export const BACKUP_FORMAT = "synq-backup";
/** Raise when a backup's layout changes in a way older apps can't read. */
export const BACKUP_VERSION = 1;

/** The library's media folders in Documents, as 2.5.2 laid them out. */
export const LIBRARY_FOLDERS = [
  "library",
  "albums",
  "artists",
  "playlists",
] as const;

export interface BackupManifest {
  readonly format: typeof BACKUP_FORMAT;
  readonly version: number;
  readonly createdAt: number;
}

function positiveInteger(value: unknown) {
  return typeof value === "number" && Number.isInteger(value) && value > 0
    ? value
    : null;
}

/** A parsed manifest, or null when it isn't a SYNQ backup's. */
export function manifestFrom(json: unknown) {
  if (typeof json !== "object" || json === null) return null;
  const version = positiveInteger(Reflect.get(json, "version"));
  if (Reflect.get(json, "format") !== BACKUP_FORMAT || version === null) {
    return null;
  }
  return {
    createdAt: positiveInteger(Reflect.get(json, "createdAt")) ?? 0,
    format: BACKUP_FORMAT,
    version,
  } satisfies BackupManifest;
}

/** At the zip's root or one folder down (a zip someone re-made). */
function atRootOrOneDown(paths: readonly string[], file: string) {
  return paths.some((path) => {
    const parts = path.replace(/^\/+/, "").split("/");
    const at = parts.slice(-file.split("/").length).join("/");
    return (
      at === file &&
      parts.length - file.split("/").length <= 1 &&
      !parts[0]?.startsWith("__MACOSX")
    );
  });
}

/**
 * Which SYNQ made a zip, from its entry paths: "synq" for 3.0 (a manifest
 * and `library.db`), "legacy" for 2.5.2 (`SQLite/synq.db`), else null.
 */
export function backupKind(paths: readonly string[]) {
  if (
    atRootOrOneDown(paths, "manifest.json") &&
    atRootOrOneDown(paths, "library.db")
  ) {
    return "synq" as const;
  }
  if (atRootOrOneDown(paths, "SQLite/synq.db")) return "legacy" as const;
  return null;
}
