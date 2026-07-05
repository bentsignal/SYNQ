import {
  formatRemainingDurationMs,
} from "../../app-shell/services/duration-format-service";
import type {
  PlaybackQueueItem,
  PlaybackState,
} from "../types/playback-state";
import {
  getPlaybackPlayerHref,
  getPlaybackQueueHref,
} from "./playback-screen-state-service";

const hiddenMiniPlayerRoutes = new Set<string>([
  getPlaybackPlayerHref(),
  getPlaybackQueueHref(),
]);

export const getPlaybackMiniPlayerState = ({
  activeTrack,
  pathname,
  state,
}: {
  activeTrack: PlaybackQueueItem | null;
  pathname: string;
  state: PlaybackState;
}) => {
  if (!activeTrack || hiddenMiniPlayerRoutes.has(pathname)) {
    return {
      blockedByAd: false,
      canTogglePlayback: false,
      isVisible: false,
      metaLabel: "",
      playLabel: "Play",
      title: "",
    };
  }

  const blockedByAd = state.adGate.active || state.adGate.due;

  return {
    blockedByAd,
    canTogglePlayback: !blockedByAd,
    isVisible: true,
    metaLabel: blockedByAd
      ? "Ad break ready"
      : `${activeTrack.artist} - ${formatRemainingDurationMs({
          duration: state.duration,
          position: state.position,
        })}`,
    playLabel: state.isPlaying ? "Pause" : "Play",
    title: activeTrack.title,
  };
};

export const getPlaybackMiniPlayerViewState = ({
  activeTrack,
  pathname,
  state,
}: {
  activeTrack: PlaybackQueueItem | null;
  pathname: string;
  state: PlaybackState;
}) => ({
  miniPlayer: getPlaybackMiniPlayerState({ activeTrack, pathname, state }),
  playerHref: getPlaybackPlayerHref(),
});
