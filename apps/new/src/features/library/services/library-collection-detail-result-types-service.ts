import type {
  AlbumDetailRow,
  ArtistDetailRow,
  CollectionImagePathResolver,
  LibraryCollectionDetail,
  LibraryCollectionDetailSongRow,
  PlaylistDetailRow,
} from "./library-collection-detail-service";

export type LibraryCollectionDetailResult = {
  detail: LibraryCollectionDetail;
  errors: unknown[];
};

export type LibraryCollectionDetailResultMetadataParams = {
  collectionError: unknown;
  songsError: unknown;
  songsUpdatedAt: Date | null | undefined;
};

export type PlaylistDetailResultParams =
  LibraryCollectionDetailResultMetadataParams & {
    getImagePath: CollectionImagePathResolver;
    playlistRows: PlaylistDetailRow[];
    playlistUpdatedAt: Date | null | undefined;
    songRows: LibraryCollectionDetailSongRow[];
  };

export type AlbumDetailResultParams =
  LibraryCollectionDetailResultMetadataParams & {
    albumRows: AlbumDetailRow[];
    albumUpdatedAt: Date | null | undefined;
    getImagePath: CollectionImagePathResolver;
    songRows: LibraryCollectionDetailSongRow[];
  };

export type ArtistDetailResultParams =
  LibraryCollectionDetailResultMetadataParams & {
    artistRows: ArtistDetailRow[];
    artistUpdatedAt: Date | null | undefined;
    getImagePath: CollectionImagePathResolver;
    songRows: LibraryCollectionDetailSongRow[];
  };
