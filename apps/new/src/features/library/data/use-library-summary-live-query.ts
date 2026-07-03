import { useLiveQuery } from "drizzle-orm/expo-sqlite";
import {
  buildAlbumSummaryRowsQuery,
  buildArtistSummaryRowsQuery,
  buildPlaylistSummaryRowsQuery,
  buildSongSummaryRowsQuery,
} from "../repository/library-summary-query-repository";

export function useLibrarySummaryLiveQuery() {
  const songs = useLiveQuery(buildSongSummaryRowsQuery());
  const playlists = useLiveQuery(buildPlaylistSummaryRowsQuery());
  const albums = useLiveQuery(buildAlbumSummaryRowsQuery());
  const artists = useLiveQuery(buildArtistSummaryRowsQuery());

  return {
    albums,
    artists,
    playlists,
    songs,
  };
}
