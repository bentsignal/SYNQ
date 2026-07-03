import { useLibrarySongPreviewQuery } from "@/src/features/library/hooks/use-library-song-preview-query";
import { useLibrarySummaryQuery } from "@/src/features/library/hooks/use-library-summary-query";
import {
  usePlaybackActiveTrack,
  usePlaybackState,
} from "@/src/features/playback/hooks/use-playback-session-selectors";
import {
  getHomeGuideSections,
  getHomeNowPlayingState,
} from "../services/home-screen-service";

export function useHomeScreenController() {
  const summary = useLibrarySummaryQuery();
  const recentSongs = useLibrarySongPreviewQuery({ limit: 4 });
  const activeTrack = usePlaybackActiveTrack();
  const state = usePlaybackState();
  const guideSections = getHomeGuideSections();
  const hasLibrary = summary.counts.songs > 0;
  const nowPlaying = getHomeNowPlayingState({ activeTrack, state });

  return {
    guideSections,
    hasLibrary,
    nowPlaying,
    recentSongs,
    summary,
  };
}

export type HomeScreenController = ReturnType<typeof useHomeScreenController>;
