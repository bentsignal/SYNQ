import {
  type AlbumPreviewRow,
  type ArtistPreviewRow,
  type CollectionPreviewImagePathResolver,
  type PlaylistPreviewRow,
} from "./library-collection-preview-row-service";
import {
  buildLibraryCollectionPreviewGroup,
  getLibraryCollectionPreviewTotals,
} from "./library-collection-preview-query-builder-service";
import {
  isLibraryCollectionPreviewGroupEmpty,
  type CollectionPreviewGroup,
} from "./library-collection-preview-query-group-service";
import {
  getLibraryCollectionPreviewErrors,
  getLibraryCollectionPreviewUpdatedAt,
} from "./library-collection-preview-query-metadata-service";

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
  const collections = buildLibraryCollectionPreviewGroup({
    albumRows,
    artistRows,
    getImagePath,
    limit,
    playlistRows,
  });

  return {
    collections,
    errors: getLibraryCollectionPreviewErrors({
      albumError,
      artistError,
      playlistError,
    }),
    isEmpty: isLibraryCollectionPreviewGroupEmpty(collections),
    totals: getLibraryCollectionPreviewTotals({
      albumRows,
      artistRows,
      playlistRows,
    }),
    updatedAt: getLibraryCollectionPreviewUpdatedAt({
      albumUpdatedAt,
      artistUpdatedAt,
      playlistUpdatedAt,
    }),
  };
};

export { isLibraryCollectionPreviewGroupEmpty } from "./library-collection-preview-query-group-service";
export type { CollectionPreviewGroup } from "./library-collection-preview-query-group-service";
export {
  getLibraryCollectionPreviewErrors,
  getLibraryCollectionPreviewUpdatedAt,
} from "./library-collection-preview-query-metadata-service";
export {
  buildLibraryCollectionPreviewGroup,
  getLibraryCollectionPreviewTotals,
} from "./library-collection-preview-query-builder-service";
