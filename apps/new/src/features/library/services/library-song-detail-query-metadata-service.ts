import type {
  LibrarySongDetailQueryErrorParams,
  LibrarySongDetailQueryUpdatedAtParams,
} from "./library-song-detail-query-result-types-service";
import {
  getQueryResultErrors,
  getQueryResultUpdatedAt,
} from "./library-query-result-metadata-service";

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
