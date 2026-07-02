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
