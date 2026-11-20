/**
 * How many prepared statements a connection keeps. A statement is a few KB
 * of SQLite's memory; the library's queries are a few hundred distinct SQL
 * texts, and the ones a screen runs again stay at the front.
 */
export const STATEMENT_CACHE_SIZE = 128;

interface Finalizable {
  finalizeSync(): void;
}

interface Preparing<Statement extends Finalizable> {
  prepareSync(source: string): Statement;
}

/**
 * A client for Drizzle that reuses the connection's prepared statements, by
 * SQL text, and finalizes the ones it stops keeping.
 *
 * Drizzle's expo driver prepares a statement for every query it runs and
 * never finalizes it, and expo-sqlite frees a statement only when it's
 * finalized or the database closes. library.db stays open, so without this
 * every query ever run (every like, every imported song) would stay in
 * SQLite's memory until the app quit.
 *
 * Reusing one is safe: expo-sqlite resets a statement and clears its
 * bindings before every run, and Drizzle reads each result before it
 * returns, so no two runs of one statement overlap. Drizzle's driver calls
 * only `prepareSync`, so that's all this has; the connection itself is left
 * as it is, since its own helpers (`runSync`, `getAllSync`) finalize the
 * statements they prepare.
 */
export function cacheStatements<Statement extends Finalizable>(
  client: Preparing<Statement>,
  size = STATEMENT_CACHE_SIZE,
) {
  const statements = new Map<string, Statement>();
  return {
    prepareSync(source: string) {
      const cached = statements.get(source);
      if (cached !== undefined) {
        // Most recently used goes last; the first is the next to go.
        statements.delete(source);
        statements.set(source, cached);
        return cached;
      }
      const statement = client.prepareSync(source);
      statements.set(source, statement);
      if (statements.size > size) {
        const [oldest, evicted] = statements.entries().next().value ?? [];
        if (oldest !== undefined && evicted !== undefined) {
          statements.delete(oldest);
          finalizeQuietly(evicted);
        }
      }
      return statement;
    },
  } satisfies Preparing<Statement>;
}

/**
 * SQLite's finalize reports the statement's last error again (a failed
 * insert), though it frees the statement either way.
 */
function finalizeQuietly(statement: Finalizable) {
  try {
    statement.finalizeSync();
  } catch {
    // Freed regardless.
  }
}
