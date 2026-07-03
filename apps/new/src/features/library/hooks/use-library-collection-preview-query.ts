import { useMemo } from "react";
import { getImagePathFromHash } from "@/src/features/images/services/image-storage-service";
import { useLibraryCollectionPreviewLiveQuery } from "../data/use-library-collection-preview-live-query";
import {
  albumRowsToPreview,
  artistRowsToPreview,
  playlistRowsToPreview,
  type AlbumPreviewRow,
  type ArtistPreviewRow,
  type PlaylistPreviewRow,
} from "../services/library-collection-preview-row-service";

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

  const collections = useMemo(
    () => ({
      albums: albumRowsToPreview({
        getImagePath: getSmallImagePath,
        limit,
        rows: (albums.data ?? []) as AlbumPreviewRow[],
      }),
      artists: artistRowsToPreview({
        getImagePath: getSmallImagePath,
        limit,
        rows: (artists.data ?? []) as ArtistPreviewRow[],
      }),
      playlists: playlistRowsToPreview({
        getImagePath: getSmallImagePath,
        limit,
        rows: (playlists.data ?? []) as PlaylistPreviewRow[],
      }),
    }),
    [albums.data, artists.data, limit, playlists.data],
  );
  const totals = {
    albums: albumRowsToPreview({
      rows: (albums.data ?? []) as AlbumPreviewRow[],
      limit: null,
    }).length,
    artists: artistRowsToPreview({
      rows: (artists.data ?? []) as ArtistPreviewRow[],
      limit: null,
    }).length,
    playlists: playlistRowsToPreview({
      rows: (playlists.data ?? []) as PlaylistPreviewRow[],
      limit: null,
    }).length,
  };

  return {
    collections,
    errors: [playlists.error, albums.error, artists.error].filter(Boolean),
    isEmpty:
      collections.albums.length === 0 &&
      collections.artists.length === 0 &&
      collections.playlists.length === 0,
    updatedAt: Math.max(
      playlists.updatedAt?.getTime() ?? 0,
      albums.updatedAt?.getTime() ?? 0,
      artists.updatedAt?.getTime() ?? 0,
    ),
    totals,
  };
}
