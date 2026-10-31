/**
 * The database handle every query and write takes.
 *
 * It is any *synchronous* Drizzle SQLite database over this schema: the app
 * passes `drizzle(openDatabaseSync("library.db"), { schema })` from
 * `drizzle-orm/expo-sqlite`, and node tests pass the same driver over a
 * `node:sqlite` shim (`src/testing/node-sqlite.ts`). Sync matters because
 * Drizzle's expo-sqlite transactions are synchronous: an async callback would
 * commit before its awaits ran, so every write here uses `.run()`, `.all()`,
 * and `.get()` inside `db.transaction(() => ...)`.
 */
import type { BaseSQLiteDatabase } from "drizzle-orm/sqlite-core";

import type * as schema from "./schema.ts";

export type LibrarySchema = typeof schema;

// eslint-disable-next-line @typescript-eslint/no-explicit-any -- the run-result type differs per driver
export type LibraryDb = BaseSQLiteDatabase<"sync", any, LibrarySchema>;
