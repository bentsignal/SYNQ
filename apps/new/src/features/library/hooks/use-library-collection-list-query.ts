import { useMemo } from "react";
import { getImagePathFromHash } from "@/src/features/images/services/image-storage-service";
import { useLibraryCollectionListLiveQuery } from "../data/use-library-collection-list-live-query";
import {
  type LibraryCollectionListPreviewRow,
} from "../services/library-collection-list-query-service";
import { buildLibraryCollectionListQueryResult } from "../services/library-collection-list-query-result-service";
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

  return useMemo(
    () =>
      buildLibraryCollectionListQueryResult({
        error,
        getImagePath: getSmallImagePath,
        kind,
        limit,
        rows: (data ?? []) as LibraryCollectionListPreviewRow[],
        updatedAt,
      }),
    [data, error, kind, limit, updatedAt],
  );
}

export type { CollectionKind } from "../services/library-collection-preview-service";
