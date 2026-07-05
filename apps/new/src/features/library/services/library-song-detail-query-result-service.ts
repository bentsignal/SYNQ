import { buildLibrarySongDetail } from "./library-song-detail-service";
import type {
  LibrarySongDetailQueryErrorParams,
  LibrarySongDetailQueryResult,
  LibrarySongDetailQueryResultParams,
  LibrarySongDetailQueryUpdatedAtParams,
} from "./library-song-detail-query-result-types-service";
import {
  getQueryResultErrors,
  getQueryResultUpdatedAt,
} from "./library-query-result-metadata-service";

export type {
  LibrarySongDetailQueryErrorParams,
  LibrarySongDetailQueryResult,
  LibrarySongDetailQueryResultParams,
  LibrarySongDetailQueryUpdatedAtParams,
  SongDetailImagePathResolver,
} from "./library-song-detail-query-result-types-service";

export const getLibrarySongDetailQueryErrors = ({
  albumError,
  artistError,
  likedError,
  playlistError,
  songError,
}: LibrarySongDetailQueryErrorParams) =>
  getQueryResultErrors([
    songError,
    artistError,
    albumError,
    playlistError,
    likedError,
  ]);

export const getLibrarySongDetailQueryUpdatedAt = ({
  albumUpdatedAt,
  artistUpdatedAt,
  likedUpdatedAt,
  playlistUpdatedAt,
  songUpdatedAt,
}: LibrarySongDetailQueryUpdatedAtParams) =>
  getQueryResultUpdatedAt([
    songUpdatedAt,
    artistUpdatedAt,
    albumUpdatedAt,
    playlistUpdatedAt,
    likedUpdatedAt,
  ]);

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
