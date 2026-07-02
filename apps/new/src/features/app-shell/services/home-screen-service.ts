import { formatDurationMs } from "./duration-format-service";
import type {
  PlaybackQueueItem,
  PlaybackState,
} from "../../playback/types/playback-state";

export type HomeHref =
  | "/premium"
  | "/player"
  | "/queue"
  | "/(tabs)/import"
  | "/(tabs)/library"
  | "/(tabs)/settings"
  | `/(tabs)/library/song/${number}`;

export type HomeAction = {
  detail: string;
  href: HomeHref;
  label: string;
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
    detail: "Files and Wi-Fi",
    href: "/(tabs)/import",
    label: "Import",
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

export const getHomeNowPlayingActions = (): HomeAction[] => [
  {
    detail: "Open current song",
    href: "/player",
    label: "Player",
  },
  {
    detail: "Review queued songs",
    href: "/queue",
    label: "Queue",
  },
];

export const getHomeLibraryHref = (): HomeHref => "/(tabs)/library";

export const getHomeRecentSongHref = ({
  songId,
}: {
  songId: number;
}): HomeHref => `/(tabs)/library/song/${songId}`;

export const getHomeNowPlayingState = ({
  activeTrack,
  state,
}: {
  activeTrack: PlaybackQueueItem | null;
  state: PlaybackState;
}) => {
  if (!activeTrack) {
    return {
      detailLabel: `${state.queue.length} songs in queue`,
      playbackLabel: "Nothing playing",
      title: "Choose a song to start listening",
    };
  }

  return {
    detailLabel: `${activeTrack.artist} - ${formatDurationMs(
      activeTrack.duration,
    )}`,
    playbackLabel: state.isPlaying ? "Playing now" : "Paused",
    title: activeTrack.title,
  };
};
