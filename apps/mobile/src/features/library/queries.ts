import { useSuspenseQuery } from "@tanstack/react-query";

import type { LibraryDb, LibraryTable, WriteResult } from "@synq/db";

import { queryClient } from "~/lib/query-client";
import { libraryDb } from "./database";

/** Every library query's key starts with this, so one write refreshes them. */
const LIBRARY = "library";

/**
 * A library read (`@synq/db` queries are synchronous SQLite): the first
 * render gets the answer at once from `initialData`, so library screens
 * never show a loading state, and writes (`writeLibrary`) refresh it.
 * `select` narrows what the component subscribes to.
 */
export function useLibraryQuery<Data, Selected>({
  key,
  read,
  select,
  reads,
}: {
  /** Identifies the read and its arguments, e.g. `["songs", sort, order]`. */
  key: readonly unknown[];
  read: (db: LibraryDb) => Data;
  select: (data: Data) => Selected;
  /** The tables `read` depends on (`readsChanged`); without it, every write refreshes it. */
  reads?: readonly LibraryTable[];
}) {
  return useSuspenseQuery({
    initialData: () => read(libraryDb()),
    meta: { reads },
    queryFn: () => read(libraryDb()),
    queryKey: [LIBRARY, ...key],
    select,
  }).data;
}

/** The query options for a library read, for `useSearchQuery` and prefetching. */
export function libraryQueryOptions<Data>(
  key: readonly unknown[],
  read: (db: LibraryDb) => Data,
  reads?: readonly LibraryTable[],
) {
  return {
    meta: { reads },
    queryFn: () => read(libraryDb()),
    queryKey: [LIBRARY, ...key],
  };
}

/**
 * Whether a write that changed `changed` can change a read. Reads that load
 * the whole library declare their tables, so a like, which changes only the
 * playlists', doesn't load every song again (with the queue's, and every
 * open list's) in the tap. Any other read refreshes on every write.
 */
function readsChanged(reads: unknown, changed: readonly LibraryTable[]) {
  if (!Array.isArray(reads)) return true;
  return reads.some((table) => changed.some((name) => name === table));
}

/** Refreshes one library read, for a write nothing else shows. */
export function refreshLibraryQuery(key: readonly unknown[]) {
  void queryClient.invalidateQueries({ queryKey: [LIBRARY, ...key] });
}

/**
 * Runs a library write and refreshes the library queries it can change
 * (`readsChanged`). Writes are synchronous, so the change is on screen by
 * the next frame, with no optimistic layer needed. Returns the write's value.
 */
export function writeLibrary<Value>(
  write: (db: LibraryDb) => WriteResult<Value>,
) {
  const result = write(libraryDb());
  void queryClient.invalidateQueries({
    predicate: (query) => readsChanged(query.meta?.reads, result.changed),
    queryKey: [LIBRARY],
  });
  return result.value;
}
