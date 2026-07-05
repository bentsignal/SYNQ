import {
  getQueryResultErrors,
  getQueryResultUpdatedAt,
} from "./library-query-result-metadata-service";

export const getLibraryCollectionPreviewErrors = ({
  albumError,
  artistError,
  playlistError,
}: {
  albumError: unknown;
  artistError: unknown;
  playlistError: unknown;
}) => getQueryResultErrors([playlistError, albumError, artistError]);

export const getLibraryCollectionPreviewUpdatedAt = ({
  albumUpdatedAt,
  artistUpdatedAt,
  playlistUpdatedAt,
}: {
  albumUpdatedAt: Date | null | undefined;
  artistUpdatedAt: Date | null | undefined;
  playlistUpdatedAt: Date | null | undefined;
}) =>
  getQueryResultUpdatedAt([
    playlistUpdatedAt,
    albumUpdatedAt,
    artistUpdatedAt,
  ]);
