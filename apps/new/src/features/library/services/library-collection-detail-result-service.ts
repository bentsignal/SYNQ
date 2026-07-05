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
  buildLibraryCollectionDetailResult,
} from "./library-collection-detail-result-builder-service";
import {
  getCollectionDetailResultUpdatedAt,
} from "./library-collection-detail-result-metadata-service";

export type {
  AlbumDetailResultParams,
  ArtistDetailResultParams,
  LibraryCollectionDetailResult,
  LibraryCollectionDetailResultMetadataParams,
  PlaylistDetailResultParams,
} from "./library-collection-detail-result-types-service";
export {
  getCollectionDetailResultErrors,
  getCollectionDetailResultUpdatedAt,
} from "./library-collection-detail-result-metadata-service";

export const buildPlaylistDetailResult = ({
  collectionError,
  getImagePath,
  playlistRows,
  playlistUpdatedAt,
  songRows,
  songsError,
  songsUpdatedAt,
}: PlaylistDetailResultParams): LibraryCollectionDetailResult =>
  buildLibraryCollectionDetailResult({
    detail: buildPlaylistDetail({
      getImagePath,
      playlistRows,
      songRows,
      updatedAt: getCollectionDetailResultUpdatedAt(
        playlistUpdatedAt,
        songsUpdatedAt,
      ),
    }),
    metadata: {
      collectionError,
      songsError,
      songsUpdatedAt,
    },
  });

export const buildAlbumDetailResult = ({
  albumRows,
  albumUpdatedAt,
  collectionError,
  getImagePath,
  songRows,
  songsError,
  songsUpdatedAt,
}: AlbumDetailResultParams): LibraryCollectionDetailResult =>
  buildLibraryCollectionDetailResult({
    detail: buildAlbumDetail({
      albumRows,
      getImagePath,
      songRows,
      updatedAt: getCollectionDetailResultUpdatedAt(
        albumUpdatedAt,
        songsUpdatedAt,
      ),
    }),
    metadata: {
      collectionError,
      songsError,
      songsUpdatedAt,
    },
  });

export const buildArtistDetailResult = ({
  artistRows,
  artistUpdatedAt,
  collectionError,
  getImagePath,
  songRows,
  songsError,
  songsUpdatedAt,
}: ArtistDetailResultParams): LibraryCollectionDetailResult =>
  buildLibraryCollectionDetailResult({
    detail: buildArtistDetail({
      artistRows,
      getImagePath,
      songRows,
      updatedAt: getCollectionDetailResultUpdatedAt(
        artistUpdatedAt,
        songsUpdatedAt,
      ),
    }),
    metadata: {
      collectionError,
      songsError,
      songsUpdatedAt,
    },
  });
