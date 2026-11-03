import { LibraryError } from "../index.ts";

export const NOW = 1_900_000_000_000;
export function ids(items: readonly { id: number }[]) {
  return items.map((item) => item.id);
}
export function libraryError(code: string) {
  return (error: unknown) =>
    error instanceof LibraryError && error.code === code;
}
/** Drizzle wraps driver errors; the SQLite message is on `cause`. */
export function sqliteError(pattern: RegExp) {
  return (error: unknown) => {
    const cause = error instanceof Error ? error.cause : undefined;
    return pattern.test(String(cause ?? error));
  };
}
