import type { LibrarySongPreview } from "../../library/services/library-song-preview-service";
import type { LibrarySummaryQueryResult } from "../../library/services/library-summary-query-result-service";
import type {
  PlaybackQueueItem,
  PlaybackState,
} from "../../playback/types/playback-state";
import {
  getHomeNowPlayingActions,
  getHomeNowPlayingState,
} from "./home-now-playing-service";
import {
  getHomeRecentSongsSectionState,
} from "./home-recent-songs-service";
import { getHomeGuideSections } from "./home-guide-service";
import { getHomeQuickActions } from "./home-action-service";

export const getHomeScreenViewState = ({
  activeTrack,
  recentSongs,
  state,
  summary,
}: {
  activeTrack: PlaybackQueueItem | null;
  recentSongs: LibrarySongPreview[];
  state: PlaybackState;
  summary: LibrarySummaryQueryResult;
}) => {
  const hasLibrary = summary.counts.songs > 0;

  return {
    guideSections: getHomeGuideSections(),
    nowPlaying: getHomeNowPlayingState({ activeTrack, state }),
    nowPlayingActions: getHomeNowPlayingActions(),
    quickActions: getHomeQuickActions({
      songCount: summary.counts.songs,
    }),
    recentSongsSectionState: getHomeRecentSongsSectionState({
      hasLibrary,
      songs: recentSongs,
    }),
  };
};

export type HomeScreenViewState = ReturnType<typeof getHomeScreenViewState>;

export {
  getHomeQuickActions,
  type HomeAction,
  type HomeHref,
} from "./home-action-service";
export {
  getHomeGuideSections,
  type HomeGuideSection,
} from "./home-guide-service";
