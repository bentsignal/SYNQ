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

export type HomeHref =
  | "/premium"
  | "/player"
  | "/queue"
  | "/(tabs)/import"
  | "/(tabs)/import/files"
  | "/(tabs)/import/wifi"
  | "/(tabs)/library"
  | "/(tabs)/settings"
  | `/(tabs)/library/song/${number}`;

export type HomeAction = {
  detail: string;
  href: HomeHref;
  label: string;
};

export type HomeGuideSection = {
  body: string;
  steps: string[];
  title: string;
};

export const getHomeQuickActions = ({
  songCount,
}: {
  songCount: number;
}): HomeAction[] => [
  {
    detail: `${songCount} songs`,
    href: "/(tabs)/library",
    label: "Library",
  },
  {
    detail: "Import from files",
    href: "/(tabs)/import/files",
    label: "Files",
  },
  {
    detail: "Import from computer",
    href: "/(tabs)/import/wifi",
    label: "Wi-Fi",
  },
  {
    detail: "Theme and backup",
    href: "/(tabs)/settings",
    label: "Settings",
  },
  {
    detail: "Unlock listening",
    href: "/premium",
    label: "Premium",
  },
];

export const getHomeGuideSections = (): HomeGuideSection[] => [
  {
    body: "Prepare Spotify so exported SYNQ tracks appear as local files.",
    steps: [
      "Enable Local Files in Spotify settings.",
      "Save exported songs to On My iPhone / Spotify.",
      "Open Spotify, then play them from Playlists / Local Files.",
    ],
    title: "Spotify Setup",
  },
  {
    body: "Use the export action when you want to hand songs back to Files.",
    steps: [
      "Choose Save to Files from the share sheet.",
      "Select the Spotify folder as the destination.",
      "Return to Spotify after the files finish saving.",
    ],
    title: "Export Flow",
  },
  {
    body: "Wi-Fi import runs a temporary local web server on this device.",
    steps: [
      "Open the Wi-Fi import screen while both devices are on the same network.",
      "Enter the displayed address in a desktop browser.",
      "Upload audio files directly over the local network.",
    ],
    title: "Network Transfer",
  },
];

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
