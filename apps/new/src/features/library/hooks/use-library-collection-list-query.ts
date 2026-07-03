import { useMemo } from "react";
import { getImagePathFromHash } from "@/src/features/images/services/image-storage-service";
import { useLibraryCollectionListLiveQuery } from "../data/use-library-collection-list-live-query";
import {
  rowsToCollectionListPreviews,
  type LibraryCollectionListPreviewRow,
} from "../services/library-collection-list-query-service";
import type { CollectionKind } from "../services/library-collection-preview-service";

const getSmallImagePath = (imageHash: string) =>
  getImagePathFromHash(imageHash).pathToSmallImage;

type LibraryCollectionListQueryOptions = {
  kind: CollectionKind;
  limit?: number | null;
};

export function useLibraryCollectionListQuery({
  kind,
  limit = null,
}: LibraryCollectionListQueryOptions) {
  const { data, error, updatedAt } = useLibraryCollectionListLiveQuery(kind);

  const collections = useMemo(
    () =>
      rowsToCollectionListPreviews({
        getImagePath: getSmallImagePath,
        kind,
        limit,
        rows: (data ?? []) as LibraryCollectionListPreviewRow[],
      }),
    [data, kind, limit],
  );

  return {
    collections,
    error,
    isEmpty: collections.length === 0,
    updatedAt: updatedAt?.getTime() ?? 0,
  };
}

export type { CollectionKind } from "../services/library-collection-preview-service";
