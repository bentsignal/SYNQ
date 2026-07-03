import {
  albumRowsToPreview,
  artistRowsToPreview,
  playlistRowsToPreview,
  type AlbumPreviewRow,
  type ArtistPreviewRow,
  type CollectionPreviewImagePathResolver,
  type PlaylistPreviewRow,
} from "./library-collection-preview-row-service";
import type { LibraryCollectionPreview } from "./library-collection-preview-service";

type CollectionPreviewGroup = {
  albums: LibraryCollectionPreview[];
  artists: LibraryCollectionPreview[];
  playlists: LibraryCollectionPreview[];
};

export type LibraryCollectionPreviewQueryResult = {
  collections: CollectionPreviewGroup;
  errors: unknown[];
  isEmpty: boolean;
  totals: {
    albums: number;
    artists: number;
    playlists: number;
  };
  updatedAt: number;
};

export const getLibraryCollectionPreviewErrors = ({
  albumError,
  artistError,
  playlistError,
}: {
  albumError: unknown;
  artistError: unknown;
  playlistError: unknown;
}) => [playlistError, albumError, artistError].filter(Boolean);

export const getLibraryCollectionPreviewUpdatedAt = ({
  albumUpdatedAt,
  artistUpdatedAt,
  playlistUpdatedAt,
}: {
  albumUpdatedAt: Date | null | undefined;
  artistUpdatedAt: Date | null | undefined;
  playlistUpdatedAt: Date | null | undefined;
}) =>
  Math.max(
    playlistUpdatedAt?.getTime() ?? 0,
    albumUpdatedAt?.getTime() ?? 0,
    artistUpdatedAt?.getTime() ?? 0,
  );

export const isLibraryCollectionPreviewGroupEmpty = (
  collections: CollectionPreviewGroup,
) =>
  collections.albums.length === 0 &&
  collections.artists.length === 0 &&
  collections.playlists.length === 0;

export const buildLibraryCollectionPreviewQueryResult = ({
  albumError,
  albumRows,
  albumUpdatedAt,
  artistError,
  artistRows,
  artistUpdatedAt,
  getImagePath,
  limit,
  playlistError,
  playlistRows,
  playlistUpdatedAt,
}: {
  albumError: unknown;
  albumRows: AlbumPreviewRow[];
  albumUpdatedAt: Date | null | undefined;
  artistError: unknown;
  artistRows: ArtistPreviewRow[];
  artistUpdatedAt: Date | null | undefined;
  getImagePath: CollectionPreviewImagePathResolver;
  limit: number | null;
  playlistError: unknown;
  playlistRows: PlaylistPreviewRow[];
  playlistUpdatedAt: Date | null | undefined;
}): LibraryCollectionPreviewQueryResult => {
  const collections = {
    albums: albumRowsToPreview({
      getImagePath,
      limit,
      rows: albumRows,
    }),
    artists: artistRowsToPreview({
      getImagePath,
      limit,
      rows: artistRows,
    }),
    playlists: playlistRowsToPreview({
      getImagePath,
      limit,
      rows: playlistRows,
    }),
  };

  return {
    collections,
    errors: getLibraryCollectionPreviewErrors({
      albumError,
      artistError,
      playlistError,
    }),
    isEmpty: isLibraryCollectionPreviewGroupEmpty(collections),
    totals: {
      albums: albumRowsToPreview({ limit: null, rows: albumRows }).length,
      artists: artistRowsToPreview({ limit: null, rows: artistRows }).length,
      playlists: playlistRowsToPreview({ limit: null, rows: playlistRows })
        .length,
    },
    updatedAt: getLibraryCollectionPreviewUpdatedAt({
      albumUpdatedAt,
      artistUpdatedAt,
      playlistUpdatedAt,
    }),
  };
};
