import type { LibraryCollectionPreview } from "./library-collection-preview-service";

const normalizeQuery = (query?: string) => query?.trim().toLowerCase() ?? "";

const collectionMatchesQuery = (
  collection: LibraryCollectionPreview,
  query: string,
) => {
  if (!query) {
    return true;
  }

  return [collection.title, collection.meta, collection.detail].some((value) =>
    value.toLowerCase().includes(query),
  );
};

export const filterCollectionPreviews = ({
  collections,
  query,
}: {
  collections: LibraryCollectionPreview[];
  query?: string;
}) => {
  const normalizedQuery = normalizeQuery(query);

  return collections.filter((collection) =>
    collectionMatchesQuery(collection, normalizedQuery),
  );
};

export const getLibraryCollectionListState = ({
  collections,
  emptyLabel,
  errors,
  formatUpdatedAt = (updatedAt) =>
    new Date(updatedAt).toLocaleTimeString(),
  query,
  updatedAt,
}: {
  collections: LibraryCollectionPreview[];
  emptyLabel: string;
  errors: readonly unknown[];
  formatUpdatedAt?: (updatedAt: number) => string;
  query?: string;
  updatedAt: number;
}) => {
  const normalizedQuery = normalizeQuery(query);
  const visibleCollections = collections.filter((collection) =>
    collectionMatchesQuery(collection, normalizedQuery),
  );
  const hasErrors = errors.length > 0;

  return {
    emptyLabel: normalizedQuery ? "No matching collections" : emptyLabel,
    hasErrors,
    statusLabel: hasErrors
      ? "One or more collection queries failed."
      : updatedAt > 0
        ? `Updated ${formatUpdatedAt(updatedAt)}`
        : "Waiting for library data",
    visibleCollections,
  };
};

export type LibraryCollectionListState = ReturnType<
  typeof getLibraryCollectionListState
>;
