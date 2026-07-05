import { buildLibrarySongDetail } from "./library-song-detail-service";
import type {
  LibrarySongDetail,
  LibrarySongDetailAlbumRow,
  LibrarySongDetailArtistRow,
  LibrarySongDetailLikedRow,
  LibrarySongDetailPlaylistRow,
  LibrarySongDetailSongRow,
} from "./library-song-detail-types-service";

type SongDetailImagePathResolver = (imageHash: string) => string;

export type LibrarySongDetailQueryResult = {
  detail: LibrarySongDetail;
  errors: unknown[];
};

export const getLibrarySongDetailQueryErrors = ({
  albumError,
  artistError,
  likedError,
  playlistError,
  songError,
}: {
  albumError: unknown;
  artistError: unknown;
  likedError: unknown;
  playlistError: unknown;
  songError: unknown;
}) =>
  [songError, artistError, albumError, playlistError, likedError].filter(
    Boolean,
  );

export const getLibrarySongDetailQueryUpdatedAt = ({
  albumUpdatedAt,
  artistUpdatedAt,
  likedUpdatedAt,
  playlistUpdatedAt,
  songUpdatedAt,
}: {
  albumUpdatedAt: Date | null | undefined;
  artistUpdatedAt: Date | null | undefined;
  likedUpdatedAt: Date | null | undefined;
  playlistUpdatedAt: Date | null | undefined;
  songUpdatedAt: Date | null | undefined;
}) =>
  Math.max(
    songUpdatedAt?.getTime() ?? 0,
    artistUpdatedAt?.getTime() ?? 0,
    albumUpdatedAt?.getTime() ?? 0,
    playlistUpdatedAt?.getTime() ?? 0,
    likedUpdatedAt?.getTime() ?? 0,
  );

export const buildLibrarySongDetailQueryResult = ({
  albumError,
  albumRows,
  albumUpdatedAt,
  artistError,
  artistRows,
  artistUpdatedAt,
  getImagePath,
  likedError,
  likedRows,
  likedUpdatedAt,
  playlistError,
  playlistRows,
  playlistUpdatedAt,
  songError,
  songRow,
  songUpdatedAt,
}: {
  albumError: unknown;
  albumRows: LibrarySongDetailAlbumRow[];
  albumUpdatedAt: Date | null | undefined;
  artistError: unknown;
  artistRows: LibrarySongDetailArtistRow[];
  artistUpdatedAt: Date | null | undefined;
  getImagePath?: SongDetailImagePathResolver;
  likedError: unknown;
  likedRows: LibrarySongDetailLikedRow[];
  likedUpdatedAt: Date | null | undefined;
  playlistError: unknown;
  playlistRows: LibrarySongDetailPlaylistRow[];
  playlistUpdatedAt: Date | null | undefined;
  songError: unknown;
  songRow: LibrarySongDetailSongRow | null;
  songUpdatedAt: Date | null | undefined;
}): LibrarySongDetailQueryResult => ({
  detail: buildLibrarySongDetail({
    albumRows,
    artistRows,
    getImagePath,
    likedRows,
    playlistRows,
    songRow,
    updatedAt: getLibrarySongDetailQueryUpdatedAt({
      albumUpdatedAt,
      artistUpdatedAt,
      likedUpdatedAt,
      playlistUpdatedAt,
      songUpdatedAt,
    }),
  }),
  errors: getLibrarySongDetailQueryErrors({
    albumError,
    artistError,
    likedError,
    playlistError,
    songError,
  }),
});
