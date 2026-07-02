import { useLibrarySongPreviewQuery } from "@/src/features/library/hooks/use-library-song-preview-query";
import { useLibrarySummaryQuery } from "@/src/features/library/hooks/use-library-summary-query";
import { usePlaybackSession } from "@/src/features/playback/hooks/use-playback-session";
import { getHomeNowPlayingState } from "../services/home-screen-service";

export function useHomeScreenController() {
  const summary = useLibrarySummaryQuery();
  const recentSongs = useLibrarySongPreviewQuery({ limit: 4 });
  const { activeTrack, state } = usePlaybackSession();
  const hasLibrary = summary.counts.songs > 0;
  const nowPlaying = getHomeNowPlayingState({ activeTrack, state });

  return {
    hasLibrary,
    nowPlaying,
    recentSongs,
    summary,
  };
}

export type HomeScreenController = ReturnType<typeof useHomeScreenController>;
