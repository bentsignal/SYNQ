import { useLibrarySummaryLiveQuery } from "../data/use-library-summary-live-query";

const getCount = (rows: unknown[] | undefined) => rows?.length ?? 0;

export function useLibrarySummaryQuery() {
  const { albums, artists, playlists, songs } = useLibrarySummaryLiveQuery();

  return {
    counts: {
      albums: getCount(albums.data),
      artists: getCount(artists.data),
      playlists: getCount(playlists.data),
      songs: getCount(songs.data),
    },
    errors: [
      songs.error,
      playlists.error,
      albums.error,
      artists.error,
    ].filter(Boolean),
    updatedAt: Math.max(
      songs.updatedAt?.getTime() ?? 0,
      playlists.updatedAt?.getTime() ?? 0,
      albums.updatedAt?.getTime() ?? 0,
      artists.updatedAt?.getTime() ?? 0,
    ),
  };
}
