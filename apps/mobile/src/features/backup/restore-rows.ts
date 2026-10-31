import type { LibraryDb } from "@synq/db";
import { libraryMigrations } from "@synq/db";

/** Why a restore stopped. */
export class RestoreError extends Error {
  readonly code: "newer" | "not-a-backup" | "files";

  constructor(code: RestoreError["code"], message: string) {
    super(message);
    this.code = code;
  }
}

export function sqlString(value: string) {
  return `'${value.replaceAll("'", "''")}'`;
}

export function countRows(db: LibraryDb, table: string) {
  const row = db.get<{ n: number }>(`SELECT count(*) AS n FROM ${table}`);
  return row.n;
}

/** The tables a 3.0 backup's rows replace, children last. */
export const TABLES = [
  "artists",
  "albums",
  "songs",
  "playlists",
  "song_artists",
  "album_songs",
  "album_artists",
  "playlist_songs",
] as const;

function columns(db: LibraryDb, schemaName: string, table: string) {
  return db
    .all<{ name: string }>(`PRAGMA ${schemaName}.table_info(${table})`)
    .map((column) => column.name);
}

/**
 * Replaces the library's rows with a 3.0 backup's, in one transaction:
 * the columns both share, `sqlite_sequence` never lowered (so ids, and
 * the folders named by them, are never reissued), and this device's
 * record of its 2.5.2 import kept unless the backup has one, so the
 * importer never runs over a restored library.
 */
export function restoreRows(db: LibraryDb, backupPath: string) {
  // A fresh name each time: see `detach`.
  const alias = `backup_${Date.now().toString(36)}`;
  db.run(`ATTACH DATABASE ${sqlString(backupPath)} AS ${alias}`);
  try {
    copyRows(db, alias);
  } catch (error) {
    detach(db, alias);
    throw error;
  }
  detach(db, alias);
}

/**
 * Detaches a restored backup. SQLite refuses while statements that read it
 * are still open (the driver finalizes them lazily); the attachment is
 * then harmless and goes with the connection at the next launch.
 */
function detach(db: LibraryDb, alias: string) {
  try {
    db.run(`DETACH DATABASE ${alias}`);
  } catch {
    // As above.
  }
}

function copyRows(db: LibraryDb, alias: string) {
  const newest = libraryMigrations.journal.entries.at(-1)?.when ?? 0;
  const backupNewest =
    db.get<{ when: number | null } | undefined>(
      `SELECT max(created_at) AS "when" FROM ${alias}.__drizzle_migrations`,
    )?.when ?? 0;
  if (backupNewest > newest) {
    throw new RestoreError("newer", "This backup is from a newer SYNQ.");
  }
  db.transaction((tx) => {
    for (const table of [...TABLES].reverse())
      tx.run(`DELETE FROM main.${table}`);
    for (const table of TABLES) copyTable(tx, alias, table);
    if (countRows(tx, `${alias}.legacy_import`) > 0) {
      tx.run("DELETE FROM main.legacy_import");
      copyTable(tx, alias, "legacy_import");
    }
    tx.run(
      `UPDATE main.sqlite_sequence SET seq = max(seq, coalesce((SELECT b.seq FROM ${alias}.sqlite_sequence b WHERE b.name = main.sqlite_sequence.name), 0))`,
    );
  });
}

/** Copies a table's rows, in the columns both databases share. */
function copyTable(db: LibraryDb, alias: string, table: string) {
  const main = new Set(columns(db, "main", table));
  const shared = columns(db, alias, table).filter((name) => main.has(name));
  if (shared.length === 0) return;
  const list = shared.map((name) => `"${name}"`).join(", ");
  db.run(
    `INSERT INTO main.${table} (${list}) SELECT ${list} FROM ${alias}.${table}`,
  );
}
