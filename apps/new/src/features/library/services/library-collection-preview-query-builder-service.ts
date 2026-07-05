import {
  albumRowsToPreview,
  artistRowsToPreview,
  playlistRowsToPreview,
  type AlbumPreviewRow,
  type ArtistPreviewRow,
  type CollectionPreviewImagePathResolver,
  type PlaylistPreviewRow,
} from "./library-collection-preview-row-service";

export const buildLibraryCollectionPreviewGroup = ({
  albumRows,
  artistRows,
  getImagePath,
  limit,
  playlistRows,
}: {
  albumRows: AlbumPreviewRow[];
  artistRows: ArtistPreviewRow[];
  getImagePath: CollectionPreviewImagePathResolver;
  limit: number | null;
  playlistRows: PlaylistPreviewRow[];
}) => ({
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
});

export const getLibraryCollectionPreviewTotals = ({
  albumRows,
  artistRows,
  playlistRows,
}: {
  albumRows: AlbumPreviewRow[];
  artistRows: ArtistPreviewRow[];
  playlistRows: PlaylistPreviewRow[];
}) => ({
  albums: albumRowsToPreview({ limit: null, rows: albumRows }).length,
  artists: artistRowsToPreview({ limit: null, rows: artistRows }).length,
  playlists: playlistRowsToPreview({ limit: null, rows: playlistRows }).length,
});
