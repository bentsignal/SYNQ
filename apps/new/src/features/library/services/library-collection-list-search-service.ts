import type { LibraryCollectionPreview } from "./library-collection-preview-service";

export const normalizeLibraryCollectionListQuery = (query?: string) =>
  query?.trim().toLowerCase() ?? "";

export const libraryCollectionMatchesQuery = (
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
  const normalizedQuery = normalizeLibraryCollectionListQuery(query);

  return collections.filter((collection) =>
    libraryCollectionMatchesQuery(collection, normalizedQuery),
  );
};
