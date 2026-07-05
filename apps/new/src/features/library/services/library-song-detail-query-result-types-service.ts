import type {
  LibrarySongDetail,
  LibrarySongDetailAlbumRow,
  LibrarySongDetailArtistRow,
  LibrarySongDetailLikedRow,
  LibrarySongDetailPlaylistRow,
  LibrarySongDetailSongRow,
} from "./library-song-detail-types-service";

export type SongDetailImagePathResolver = (imageHash: string) => string;

export type LibrarySongDetailQueryResult = {
  detail: LibrarySongDetail;
  errors: unknown[];
};

export type LibrarySongDetailQueryErrorParams = {
  albumError: unknown;
  artistError: unknown;
  likedError: unknown;
  playlistError: unknown;
  songError: unknown;
};

export type LibrarySongDetailQueryUpdatedAtParams = {
  albumUpdatedAt: Date | null | undefined;
  artistUpdatedAt: Date | null | undefined;
  likedUpdatedAt: Date | null | undefined;
  playlistUpdatedAt: Date | null | undefined;
  songUpdatedAt: Date | null | undefined;
};

export type LibrarySongDetailQueryResultParams =
  LibrarySongDetailQueryErrorParams &
    LibrarySongDetailQueryUpdatedAtParams & {
      albumRows: LibrarySongDetailAlbumRow[];
      artistRows: LibrarySongDetailArtistRow[];
      getImagePath?: SongDetailImagePathResolver;
      likedRows: LibrarySongDetailLikedRow[];
      playlistRows: LibrarySongDetailPlaylistRow[];
      songRow: LibrarySongDetailSongRow | null;
    };
