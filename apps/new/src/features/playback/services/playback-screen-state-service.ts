import {
  formatDurationMs,
  formatRemainingDurationMs,
} from "../../app-shell/services/duration-format-service";
import type {
  PlaybackQueueItem,
  PlaybackState,
} from "../types/playback-state";
import { getPlaybackQueueActionState } from "./playback-queue-action-state-service";

export type PlaybackHref = "/player" | "/premium" | "/queue";

export const getPlaybackPlayerHref = (): PlaybackHref => "/player";

export const getPlaybackPremiumHref = (): PlaybackHref => "/premium";

export const getPlaybackQueueHref = (): PlaybackHref => "/queue";

export const getPlaybackQueueEmptyState = () => ({
  body: "Open a song from Library to start listening.",
  title: "Queue is empty",
});

export const getPlaybackQueueScreenState = () => ({
  adBreakPanel: {
    action: {
      href: getPlaybackPremiumHref(),
      label: "Open Premium",
    },
    body:
      "Queue playback commands are paused while the bundled ad plays. Your song resumes automatically when the ad finishes.",
    kicker: "Premium gate",
    title: "Ad break required",
  },
  backLink: {
    href: getPlaybackPlayerHref(),
    label: "Back to player",
  },
  clearQueueLabel: "Clear queue",
  emptyState: getPlaybackQueueEmptyState(),
  header: {
    kicker: "Playback queue",
    subtitle:
      "Reorder upcoming songs, remove tracks, or jump to a different song.",
    title: "Now Playing",
  },
});

export const getPlaybackQueueViewState = ({
  queueLength,
}: {
  queueLength: number;
}) => ({
  actionState: getPlaybackQueueActionState({ queueLength }),
  screenState: getPlaybackQueueScreenState(),
});

export const getPlaybackPlayerScreenState = () => ({
  header: {
    kicker: "Now Playing",
    subtitle:
      "Control playback, queue movement, shuffle, repeat, and free-listening ad breaks.",
    title: "Player",
  },
  queueLink: {
    href: getPlaybackQueueHref(),
    label: "Open queue",
  },
});

export const getPlaybackAdBreakPanelState = ({
  state,
}: {
  state: PlaybackState;
}) => ({
  action: {
    href: getPlaybackPremiumHref(),
    label: "Open Premium",
  },
  body:
    "Free playback pauses after 10 minutes of listening. The ad will resume your song when it finishes, or you can open Premium for ad-free listening.",
  kicker: "Premium gate",
  progressLabel: `${formatDurationMs(state.adGate.playbackPosition)} / ${formatDurationMs(
    state.adGate.playbackDuration,
  )}`,
  title: "Ad break required",
});

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
