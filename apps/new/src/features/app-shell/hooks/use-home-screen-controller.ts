import { useLibrarySongPreviewQuery } from "@/src/features/library/hooks/use-library-song-preview-query";
import { useLibrarySummaryQuery } from "@/src/features/library/hooks/use-library-summary-query";
import {
  usePlaybackActiveTrack,
  usePlaybackState,
} from "@/src/features/playback/hooks/use-playback-session-selectors";
import { getHomeScreenViewState } from "../services/home-screen-service";

export function useHomeScreenController() {
  const summary = useLibrarySummaryQuery();
  const recentSongs = useLibrarySongPreviewQuery({ limit: 4 });
  const activeTrack = usePlaybackActiveTrack();
  const state = usePlaybackState();
  const viewState = getHomeScreenViewState({
    activeTrack,
    recentSongs: recentSongs.songs,
    state,
    summary,
  });

  return {
    viewState,
  };
}

export type HomeScreenController = ReturnType<typeof useHomeScreenController>;
