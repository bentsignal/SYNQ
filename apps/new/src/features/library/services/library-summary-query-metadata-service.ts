import {
  getQueryResultErrors,
  getQueryResultUpdatedAt,
} from "./library-query-result-metadata-service";

export const getLibrarySummaryQueryErrors = ({
  albumError,
  artistError,
  playlistError,
  songError,
}: {
  albumError: unknown;
  artistError: unknown;
  playlistError: unknown;
  songError: unknown;
}) => getQueryResultErrors([songError, playlistError, albumError, artistError]);

export const getLibrarySummaryQueryUpdatedAt = ({
  albumUpdatedAt,
  artistUpdatedAt,
  playlistUpdatedAt,
  songUpdatedAt,
}: {
  albumUpdatedAt: Date | null | undefined;
  artistUpdatedAt: Date | null | undefined;
  playlistUpdatedAt: Date | null | undefined;
  songUpdatedAt: Date | null | undefined;
}) =>
  getQueryResultUpdatedAt([
    songUpdatedAt,
    playlistUpdatedAt,
    albumUpdatedAt,
    artistUpdatedAt,
  ]);
