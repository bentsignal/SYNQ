import { formatRemainingDurationMs } from "../../app-shell/services/duration-format-service";
import type {
  PlaybackQueueItem,
  PlaybackState,
} from "../types/playback-state";

export const playerSeekStepMs = 15_000;

const hiddenMiniPlayerRoutes = new Set(["/player", "/queue"]);

export const getPlaybackProgressPercent = ({
  duration,
  position,
}: {
  duration: number;
  position: number;
}) => {
  if (duration <= 0) {
    return 0;
  }

  return Math.round(Math.min(1, Math.max(0, position / duration)) * 100);
};

export const getFreeListeningRemainingMs = ({
  accumulatedMs,
  thresholdMs,
}: {
  accumulatedMs: number;
  thresholdMs: number;
}) => Math.max(0, thresholdMs - accumulatedMs);

export const getSeekTargetPosition = ({
  direction,
  duration,
  position,
  stepMs = playerSeekStepMs,
}: {
  direction: "backward" | "forward";
  duration: number;
  position: number;
  stepMs?: number;
}) => {
  const offset = direction === "backward" ? -stepMs : stepMs;

  return Math.max(0, Math.min(duration, position + offset));
};

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
