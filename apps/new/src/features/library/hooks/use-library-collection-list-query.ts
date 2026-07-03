import { useMemo } from "react";
import { useLiveQuery } from "drizzle-orm/expo-sqlite";
import { getImagePathFromHash } from "@/src/features/images/services/image-storage-service";
import {
  buildAlbumPreviewRowsQuery,
  buildArtistPreviewRowsQuery,
  buildPlaylistPreviewRowsQuery,
} from "../repository/collection-preview-query-repository";
import {
  rowsToCollectionListPreviews,
  type LibraryCollectionListPreviewRow,
} from "../services/library-collection-list-query-service";
import type { CollectionKind } from "../services/library-collection-preview-service";

const getSmallImagePath = (imageHash: string) =>
  getImagePathFromHash(imageHash).pathToSmallImage;

const buildCollectionListRowsQuery = (kind: CollectionKind) => {
  switch (kind) {
    case "albums":
      return buildAlbumPreviewRowsQuery();
    case "artists":
      return buildArtistPreviewRowsQuery();
    case "playlists":
    default:
      return buildPlaylistPreviewRowsQuery();
  }
};

type LibraryCollectionListQueryOptions = {
  kind: CollectionKind;
  limit?: number | null;
};

export function useLibraryCollectionListQuery({
  kind,
  limit = null,
}: LibraryCollectionListQueryOptions) {
  const { data, error, updatedAt } = useLiveQuery(
    buildCollectionListRowsQuery(kind),
  );

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
