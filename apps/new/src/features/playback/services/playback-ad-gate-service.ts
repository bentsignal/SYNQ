import type { PlaybackAction } from "./playback-session-action-service";

export {
  beginPlaybackAdBreak,
  completePlaybackAdBreak,
  initialPlaybackAdGateState,
  playbackAdProgressIntervalMs,
  playbackAdThresholdMs,
  resetPlaybackAdGate,
  trackPlaybackAdProgress,
  updatePlaybackAdBreakProgress,
} from "./playback-ad-gate-state-service";

export const getBeginPlaybackAdBreakAction = (): PlaybackAction => ({
  type: "begin-ad-break",
});

export const getCompletePlaybackAdBreakAction = (): PlaybackAction => ({
  type: "complete-ad-break",
});

export const getSyncPlaybackPremiumAction = (
  premiumActive: boolean,
): PlaybackAction => ({
  premiumActive,
  type: "sync-premium",
});
