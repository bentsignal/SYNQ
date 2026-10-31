import { Stack } from "expo-router";

import type { LibraryDb } from "@synq/db";

import { EmptyState } from "~/components/empty-state";
import {
  useSearchQuery,
  useSearchText,
} from "~/features/search/use-search-query";
import { libraryQueryOptions, useLibraryQuery } from "./queries";

/**
 * A library list that its screen's search bar filters in place: the whole
 * list from `read(db)`, or, once typing pauses, `read(db, query)`. While a
 * search loads, the previous results stay up (`useSearchQuery`).
 */
export function useSearchableList<Item>({
  key,
  read,
}: {
  key: readonly unknown[];
  read: (db: LibraryDb, search?: string) => Item[];
}) {
  const search = useSearchText();
  const all = useLibraryQuery({
    key,
    read: (db) => read(db),
    select: (items) => items,
  });
  const found = useSearchQuery({
    options: {
      ...libraryQueryOptions([...key, "search", search.query], (db) =>
        read(db, search.query),
      ),
      enabled: search.query !== "",
      select: (items) => items,
    },
    query: search.query,
  });
  const searching = found.query !== "";
  return {
    items: searching ? (found.data ?? []) : all,
    /** The query the shown items answer ("" when not searching). */
    query: found.query,
    search,
    /** The list has nothing at all, search or not. */
    empty: all.length === 0,
  };
}

/** A library list's search bar, under the large title as in Apple Music. */
export function LibrarySearchBar({
  placeholder,
  search,
}: {
  placeholder: string;
  search: ReturnType<typeof useSearchText>;
}) {
  return (
    <Stack.SearchBar
      placeholder={placeholder}
      onChangeText={(event) => search.onChangeText(event.nativeEvent.text)}
      onCancelButtonPress={search.clear}
    />
  );
}

/** What a filtered list shows when nothing matches. */
export function NoResults({ query }: { query: string }) {
  return (
    <EmptyState
      className="pt-24"
      icon="magnifyingglass"
      title={`No Results for “${query}”`}
    />
  );
}
