import { buildLibrarySongDetail } from "./library-song-detail-service";
import type {
  LibrarySongDetailQueryResult,
  LibrarySongDetailQueryResultParams,
} from "./library-song-detail-query-result-types-service";
import {
  getLibrarySongDetailQueryErrors,
  getLibrarySongDetailQueryUpdatedAt,
} from "./library-song-detail-query-metadata-service";

export type {
  LibrarySongDetailQueryErrorParams,
  LibrarySongDetailQueryResult,
  LibrarySongDetailQueryResultParams,
  LibrarySongDetailQueryUpdatedAtParams,
  SongDetailImagePathResolver,
} from "./library-song-detail-query-result-types-service";

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
}: LibrarySongDetailQueryResultParams): LibrarySongDetailQueryResult => ({
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

export {
  getLibrarySongDetailQueryErrors,
  getLibrarySongDetailQueryUpdatedAt,
} from "./library-song-detail-query-metadata-service";
