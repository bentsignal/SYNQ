import {
  buildAlbumDetail,
  buildArtistDetail,
  buildPlaylistDetail,
  type AlbumDetailRow,
  type ArtistDetailRow,
  type CollectionImagePathResolver,
  type LibraryCollectionDetail,
  type LibraryCollectionDetailSongRow,
  type PlaylistDetailRow,
} from "./library-collection-detail-service";
import {
  getQueryResultErrors,
  getQueryResultUpdatedAt,
} from "./library-query-result-metadata-service";

export type LibraryCollectionDetailResult = {
  detail: LibraryCollectionDetail;
  errors: unknown[];
};

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
}: {
  collectionError: unknown;
  getImagePath: CollectionImagePathResolver;
  playlistRows: PlaylistDetailRow[];
  playlistUpdatedAt: Date | null | undefined;
  songRows: LibraryCollectionDetailSongRow[];
  songsError: unknown;
  songsUpdatedAt: Date | null | undefined;
}): LibraryCollectionDetailResult => ({
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
}: {
  albumRows: AlbumDetailRow[];
  albumUpdatedAt: Date | null | undefined;
  collectionError: unknown;
  getImagePath: CollectionImagePathResolver;
  songRows: LibraryCollectionDetailSongRow[];
  songsError: unknown;
  songsUpdatedAt: Date | null | undefined;
}): LibraryCollectionDetailResult => ({
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
}: {
  artistRows: ArtistDetailRow[];
  artistUpdatedAt: Date | null | undefined;
  collectionError: unknown;
  getImagePath: CollectionImagePathResolver;
  songRows: LibraryCollectionDetailSongRow[];
  songsError: unknown;
  songsUpdatedAt: Date | null | undefined;
}): LibraryCollectionDetailResult => ({
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
