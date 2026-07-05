import {
  buildAlbumDetail,
  buildArtistDetail,
  buildPlaylistDetail,
} from "./library-collection-detail-service";
import type {
  AlbumDetailResultParams,
  ArtistDetailResultParams,
  LibraryCollectionDetailResult,
  PlaylistDetailResultParams,
} from "./library-collection-detail-result-types-service";
import {
  getQueryResultErrors,
  getQueryResultUpdatedAt,
} from "./library-query-result-metadata-service";

export type {
  AlbumDetailResultParams,
  ArtistDetailResultParams,
  LibraryCollectionDetailResult,
  LibraryCollectionDetailResultMetadataParams,
  PlaylistDetailResultParams,
} from "./library-collection-detail-result-types-service";

export const getCollectionDetailResultUpdatedAt = (
  collectionUpdatedAt: Date | null | undefined,
  songsUpdatedAt: Date | null | undefined,
) =>
  getQueryResultUpdatedAt([collectionUpdatedAt, songsUpdatedAt]);

export const getCollectionDetailResultErrors = (
  collectionError: unknown,
  songsError: unknown,
) => getQueryResultErrors([collectionError, songsError]);

export const buildPlaylistDetailResult = ({
  collectionError,
  getImagePath,
  playlistRows,
  playlistUpdatedAt,
  songRows,
  songsError,
  songsUpdatedAt,
}: PlaylistDetailResultParams): LibraryCollectionDetailResult => ({
  detail: buildPlaylistDetail({
    getImagePath,
    playlistRows,
    songRows,
    updatedAt: getCollectionDetailResultUpdatedAt(
      playlistUpdatedAt,
      songsUpdatedAt,
    ),
  }),
  errors: getCollectionDetailResultErrors(collectionError, songsError),
});

export const buildAlbumDetailResult = ({
  albumRows,
  albumUpdatedAt,
  collectionError,
  getImagePath,
  songRows,
  songsError,
  songsUpdatedAt,
}: AlbumDetailResultParams): LibraryCollectionDetailResult => ({
  detail: buildAlbumDetail({
    albumRows,
    getImagePath,
    songRows,
    updatedAt: getCollectionDetailResultUpdatedAt(
      albumUpdatedAt,
      songsUpdatedAt,
    ),
  }),
  errors: getCollectionDetailResultErrors(collectionError, songsError),
});

export const buildArtistDetailResult = ({
  artistRows,
  artistUpdatedAt,
  collectionError,
  getImagePath,
  songRows,
  songsError,
  songsUpdatedAt,
}: ArtistDetailResultParams): LibraryCollectionDetailResult => ({
  detail: buildArtistDetail({
    artistRows,
    getImagePath,
    songRows,
    updatedAt: getCollectionDetailResultUpdatedAt(
      artistUpdatedAt,
      songsUpdatedAt,
    ),
  }),
  errors: getCollectionDetailResultErrors(collectionError, songsError),
});
