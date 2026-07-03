import { useLibrarySummaryLiveQuery } from "../data/use-library-summary-live-query";
import { buildLibrarySummaryQueryResult } from "../services/library-summary-query-result-service";

export function useLibrarySummaryQuery() {
  const { albums, artists, playlists, songs } = useLibrarySummaryLiveQuery();

  return buildLibrarySummaryQueryResult({
    albumError: albums.error,
    albumRows: albums.data,
    albumUpdatedAt: albums.updatedAt,
    artistError: artists.error,
    artistRows: artists.data,
    artistUpdatedAt: artists.updatedAt,
    playlistError: playlists.error,
    playlistRows: playlists.data,
    playlistUpdatedAt: playlists.updatedAt,
    songError: songs.error,
    songRows: songs.data,
    songUpdatedAt: songs.updatedAt,
  });
}
