import { formatDurationMs } from "./duration-format-service";
import type {
  PlaybackQueueItem,
  PlaybackState,
} from "../../playback/types/playback-state";
import type { HomeAction } from "./home-screen-service";

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

export type HomeNowPlayingState = ReturnType<typeof getHomeNowPlayingState>;
