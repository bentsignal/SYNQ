/**
 * A minimal stand-in for expo-sqlite's synchronous `SQLiteDatabase`, backed
 * by node's built-in `node:sqlite`, so node tests run Drizzle's real
 * `drizzle-orm/expo-sqlite` driver and migrator. It implements only what
 * `ExpoSQLiteSession` calls: `prepareSync(sql)` and, on the statement,
 * `executeSync(params)` and `executeForRawResultSync(params)`.
 */
import { DatabaseSync } from "node:sqlite";
import type { SQLInputValue, StatementSync } from "node:sqlite";
// `drizzle-orm/expo-sqlite` itself re-exports `useLiveQuery`, which imports
// expo-sqlite (native); the driver entry is the same `drizzle()` without it.
import { drizzle } from "drizzle-orm/expo-sqlite/driver";
import { migrate } from "drizzle-orm/expo-sqlite/migrator";

import { libraryMigrations } from "../migrations.ts";
import * as schema from "../schema.ts";

type Row = Record<string, unknown>;

function toParams(params: unknown) {
  const list = Array.isArray(params)
    ? params
    : params === undefined
      ? []
      : [params];
  return list.map((value) => {
    // expo-sqlite binds booleans as 0/1; node:sqlite rejects them.
    if (typeof value === "boolean") return value ? 1 : 0;
    if (value === undefined) return null;
    if (isSqlInputValue(value)) return value;
    throw new TypeError(`Unsupported SQLite parameter: ${String(value)}`);
  });
}

function isSqlInputValue(value: unknown): value is SQLInputValue {
  return (
    value === null ||
    typeof value === "number" ||
    typeof value === "bigint" ||
    typeof value === "string" ||
    ArrayBuffer.isView(value)
  );
}

function returnsRows(statement: StatementSync) {
  return statement.columns().length > 0;
}

class NodeExpoStatement {
  readonly #statement: StatementSync;

  constructor(statement: StatementSync) {
    this.#statement = statement;
  }

  executeSync(params?: unknown) {
    const values = toParams(params);
    this.#statement.setReturnArrays(false);
    if (returnsRows(this.#statement)) {
      const rows = this.#statement.all(...values).map((row) => ({ ...row }));
      return {
        changes: 0,
        lastInsertRowId: 0,
        getAllSync: () => rows,
        getFirstSync: () => rows[0] ?? null,
      };
    }
    const result = this.#statement.run(...values);
    return {
      changes: Number(result.changes),
      lastInsertRowId: Number(result.lastInsertRowid),
      getAllSync: () => new Array<Row>(),
      getFirstSync: () => null,
    };
  }

  executeForRawResultSync(params?: unknown) {
    const values = toParams(params);
    if (!returnsRows(this.#statement)) {
      this.#statement.run(...values);
      return { getAllSync: () => new Array<unknown[]>() };
    }
    this.#statement.setReturnArrays(true);
    // With `setReturnArrays(true)` each row is an array of column values.
    const rows = this.#statement.all(...values);
    return { getAllSync: () => rows.map((row) => Object.values(row)) };
  }

  finalizeSync() {
    // Nothing to release: node:sqlite finalizes statements with the database.
  }
}

/** The subset of expo-sqlite's `SQLiteDatabase` that Drizzle's expo driver uses. */
export class NodeExpoDatabase {
  readonly raw: DatabaseSync;

  constructor(path = ":memory:", options?: { readOnly?: boolean }) {
    this.raw = new DatabaseSync(path, { readOnly: options?.readOnly ?? false });
  }

  prepareSync(source: string) {
    return new NodeExpoStatement(this.raw.prepare(source));
  }

  execSync(source: string) {
    this.raw.exec(source);
  }

  closeSync() {
    this.raw.close();
  }
}

/** Opens a library database the way the app does: foreign keys on, migrations applied. */
export async function openTestLibraryDb(
  path = ":memory:",
  migrations: Parameters<typeof migrate>[1] = libraryMigrations,
) {
  const client = new NodeExpoDatabase(path);
  client.execSync("PRAGMA foreign_keys = ON;");
  // eslint-disable-next-line @typescript-eslint/consistent-type-assertions -- the driver's types want expo-sqlite's class; ours implements the subset it calls
  const expoClient = client as never;
  const db = drizzle(expoClient, { schema });
  await migrate(db, migrations);
  return { db, client };
}
