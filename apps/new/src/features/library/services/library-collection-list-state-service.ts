import {
  getLibraryCollectionPreviewHref,
} from "./library-collection-preview-navigation-service";
import type { LibraryCollectionPreview } from "./library-collection-preview-service";
import {
  filterCollectionPreviews,
  normalizeLibraryCollectionListQuery,
} from "./library-collection-list-search-service";

export const getLibraryCollectionListErrors = (error: unknown) =>
  error ? [error] : [];

export const getLibraryCollectionListStatusLabel = ({
  errors,
  formatUpdatedAt = (updatedAt) =>
    new Date(updatedAt).toLocaleTimeString(),
  updatedAt,
}: {
  errors: readonly unknown[];
  formatUpdatedAt?: (updatedAt: number) => string;
  updatedAt: number;
}) =>
  errors.length > 0
    ? "One or more collection queries failed."
    : updatedAt > 0
      ? `Updated ${formatUpdatedAt(updatedAt)}`
      : "Waiting for library data";

export const getLibraryCollectionListState = ({
  collections,
  emptyLabel,
  errors,
  formatUpdatedAt,
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
  const normalizedQuery = normalizeLibraryCollectionListQuery(query);
  const visibleCollections = filterCollectionPreviews({
    collections,
    query: normalizedQuery,
  });
  const hasErrors = errors.length > 0;

  return {
    emptyLabel: normalizedQuery ? "No matching collections" : emptyLabel,
    hasErrors,
    statusLabel: getLibraryCollectionListStatusLabel({
      errors,
      formatUpdatedAt,
      updatedAt,
    }),
    visibleCollections,
    visibleRows: visibleCollections.map((collection) => ({
      collection,
      href: getLibraryCollectionPreviewHref(collection),
    })),
  };
};

export type LibraryCollectionListState = ReturnType<
  typeof getLibraryCollectionListState
>;
