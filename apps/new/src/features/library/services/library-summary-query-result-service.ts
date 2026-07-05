import {
  getLibrarySummaryQueryErrors,
  getLibrarySummaryQueryUpdatedAt,
} from "./library-summary-query-metadata-service";

type LibrarySummaryQueryRows = readonly unknown[] | undefined;

export type LibrarySummaryCounts = {
  albums: number;
  artists: number;
  playlists: number;
  songs: number;
};

export type LibrarySummaryQueryResult = {
  counts: LibrarySummaryCounts;
  errors: unknown[];
  updatedAt: number;
};

const getCount = (rows: LibrarySummaryQueryRows) => rows?.length ?? 0;

export const buildLibrarySummaryQueryResult = ({
  albumError,
  albumRows,
  albumUpdatedAt,
  artistError,
  artistRows,
  artistUpdatedAt,
  playlistError,
  playlistRows,
  playlistUpdatedAt,
  songError,
  songRows,
  songUpdatedAt,
}: {
  albumError: unknown;
  albumRows: LibrarySummaryQueryRows;
  albumUpdatedAt: Date | null | undefined;
  artistError: unknown;
  artistRows: LibrarySummaryQueryRows;
  artistUpdatedAt: Date | null | undefined;
  playlistError: unknown;
  playlistRows: LibrarySummaryQueryRows;
  playlistUpdatedAt: Date | null | undefined;
  songError: unknown;
  songRows: LibrarySummaryQueryRows;
  songUpdatedAt: Date | null | undefined;
}): LibrarySummaryQueryResult => ({
  counts: {
    albums: getCount(albumRows),
    artists: getCount(artistRows),
    playlists: getCount(playlistRows),
    songs: getCount(songRows),
  },
  errors: getLibrarySummaryQueryErrors({
    albumError,
    artistError,
    playlistError,
    songError,
  }),
  updatedAt: getLibrarySummaryQueryUpdatedAt({
    albumUpdatedAt,
    artistUpdatedAt,
    playlistUpdatedAt,
    songUpdatedAt,
  }),
});

export {
  getLibrarySummaryQueryErrors,
  getLibrarySummaryQueryUpdatedAt,
} from "./library-summary-query-metadata-service";
