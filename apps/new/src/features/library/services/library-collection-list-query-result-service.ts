import {
  rowsToCollectionListPreviews,
  type LibraryCollectionListPreviewRow,
} from "./library-collection-list-query-service";
import type {
  CollectionKind,
  LibraryCollectionPreview,
} from "./library-collection-preview-service";
import type { CollectionPreviewImagePathResolver } from "./library-collection-preview-row-service";

export type LibraryCollectionListQueryResult = {
  collections: LibraryCollectionPreview[];
  error: unknown;
  isEmpty: boolean;
  updatedAt: number;
};

export const getLibraryCollectionListQueryUpdatedAt = (
  updatedAt: Date | null | undefined,
) => updatedAt?.getTime() ?? 0;

export const buildLibraryCollectionListQueryResult = ({
  error,
  getImagePath,
  kind,
  limit,
  rows,
  updatedAt,
}: {
  error: unknown;
  getImagePath?: CollectionPreviewImagePathResolver;
  kind: CollectionKind;
  limit: number | null;
  rows: LibraryCollectionListPreviewRow[];
  updatedAt: Date | null | undefined;
}): LibraryCollectionListQueryResult => {
  const collections = rowsToCollectionListPreviews({
    getImagePath,
    kind,
    limit,
    rows,
  });

  return {
    collections,
    error,
    isEmpty: collections.length === 0,
    updatedAt: getLibraryCollectionListQueryUpdatedAt(updatedAt),
  };
};
