import { formatDurationMs } from "./duration-format-service";
import type {
  PlaybackQueueItem,
  PlaybackState,
} from "../../playback/types/playback-state";

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
