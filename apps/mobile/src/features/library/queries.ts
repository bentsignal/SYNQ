import { useSuspenseQuery } from "@tanstack/react-query";

import type { LibraryDb, WriteResult } from "@synq/db";

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
}: {
  /** Identifies the read and its arguments, e.g. `["songs", sort, order]`. */
  key: readonly unknown[];
  read: (db: LibraryDb) => Data;
  select: (data: Data) => Selected;
}) {
  return useSuspenseQuery({
    initialData: () => read(libraryDb()),
    queryFn: () => read(libraryDb()),
    queryKey: [LIBRARY, ...key],
    select,
  }).data;
}

/** The query options for a library read, for `useSearchQuery` and prefetching. */
export function libraryQueryOptions<Data>(
  key: readonly unknown[],
  read: (db: LibraryDb) => Data,
) {
  return {
    queryFn: () => read(libraryDb()),
    queryKey: [LIBRARY, ...key],
  };
}

/** Refreshes one library read, for a write nothing else shows. */
export function refreshLibraryQuery(key: readonly unknown[]) {
  void queryClient.invalidateQueries({ queryKey: [LIBRARY, ...key] });
}

/**
 * Runs a library write and refreshes every library query. Writes are
 * synchronous, so the change is on screen by the next frame, with no
 * optimistic layer needed. Returns the write's value.
 */
export function writeLibrary<Value>(
  write: (db: LibraryDb) => WriteResult<Value>,
) {
  const result = write(libraryDb());
  void queryClient.invalidateQueries({ queryKey: [LIBRARY] });
  return result.value;
}
