import { useMemo } from "react";
import { getImagePathFromHash } from "@/src/features/images/services/image-storage-service";
import { useLibraryCollectionPreviewLiveQuery } from "../data/use-library-collection-preview-live-query";
import {
  type AlbumPreviewRow,
  type ArtistPreviewRow,
  type PlaylistPreviewRow,
} from "../services/library-collection-preview-row-service";
import { buildLibraryCollectionPreviewQueryResult } from "../services/library-collection-preview-query-result-service";

export type {
  CollectionKind,
  LibraryCollectionPreview,
} from "../services/library-collection-preview-service";

const getSmallImagePath = (imageHash: string) =>
  getImagePathFromHash(imageHash).pathToSmallImage;

type LibraryCollectionPreviewQueryOptions = {
  limit?: number | null;
};

export function useLibraryCollectionPreviewQuery({
  limit = 6,
}: LibraryCollectionPreviewQueryOptions = {}) {
  const { albums, artists, playlists } =
    useLibraryCollectionPreviewLiveQuery();

  return useMemo(
    () =>
      buildLibraryCollectionPreviewQueryResult({
        albumError: albums.error,
        albumRows: (albums.data ?? []) as AlbumPreviewRow[],
        albumUpdatedAt: albums.updatedAt,
        artistError: artists.error,
        artistRows: (artists.data ?? []) as ArtistPreviewRow[],
        artistUpdatedAt: artists.updatedAt,
        getImagePath: getSmallImagePath,
        limit,
        playlistError: playlists.error,
        playlistRows: (playlists.data ?? []) as PlaylistPreviewRow[],
        playlistUpdatedAt: playlists.updatedAt,
      }),
    [
      albums.data,
      albums.error,
      albums.updatedAt,
      artists.data,
      artists.error,
      artists.updatedAt,
      limit,
      playlists.data,
      playlists.error,
      playlists.updatedAt,
    ],
  );
}
