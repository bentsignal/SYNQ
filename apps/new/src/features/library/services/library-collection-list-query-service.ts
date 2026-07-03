import {
  albumRowsToPreview,
  artistRowsToPreview,
  playlistRowsToPreview,
  type AlbumPreviewRow,
  type ArtistPreviewRow,
  type CollectionPreviewImagePathResolver,
  type PlaylistPreviewRow,
} from "./library-collection-preview-row-service";
import type {
  CollectionKind,
  LibraryCollectionPreview,
} from "./library-collection-preview-service";

export type LibraryCollectionListPreviewRow =
  | AlbumPreviewRow
  | ArtistPreviewRow
  | PlaylistPreviewRow;

export const rowsToCollectionListPreviews = ({
  getImagePath,
  kind,
  limit,
  rows,
}: {
  getImagePath?: CollectionPreviewImagePathResolver;
  kind: CollectionKind;
  limit: number | null;
  rows: LibraryCollectionListPreviewRow[];
}): LibraryCollectionPreview[] => {
  switch (kind) {
    case "albums":
      return albumRowsToPreview({
        getImagePath,
        limit,
        rows: rows as AlbumPreviewRow[],
      });
    case "artists":
      return artistRowsToPreview({
        getImagePath,
        limit,
        rows: rows as ArtistPreviewRow[],
      });
    case "playlists":
    default:
      return playlistRowsToPreview({
        getImagePath,
        limit,
        rows: rows as PlaylistPreviewRow[],
      });
  }
};
