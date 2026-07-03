import { useLiveQuery } from "drizzle-orm/expo-sqlite";
import {
  buildAlbumSummaryRowsQuery,
  buildArtistSummaryRowsQuery,
  buildPlaylistSummaryRowsQuery,
  buildSongSummaryRowsQuery,
} from "../repository/library-summary-query-repository";

const getCount = (rows: unknown[] | undefined) => rows?.length ?? 0;

export function useLibrarySummaryQuery() {
  const songs = useLiveQuery(buildSongSummaryRowsQuery());
  const playlists = useLiveQuery(buildPlaylistSummaryRowsQuery());
  const albums = useLiveQuery(buildAlbumSummaryRowsQuery());
  const artists = useLiveQuery(buildArtistSummaryRowsQuery());

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
