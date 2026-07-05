import type { PlaybackAdGateState } from "../types/playback-state";

export const canRunPlaybackWithAdGate = ({
  gate,
  premiumActive,
}: {
  gate: Pick<PlaybackAdGateState, "active" | "due">;
  premiumActive: boolean;
}) => premiumActive || (!gate.active && !gate.due);

export const shouldStartPlaybackAdBreak = ({
  gate,
  premiumActive,
}: {
  gate: Pick<PlaybackAdGateState, "active" | "due">;
  premiumActive: boolean;
}) => gate.due && !gate.active && !premiumActive;

export const shouldResumePlaybackAfterPremium = ({
  gate,
  hasActiveTrack,
  premiumActive,
}: {
  gate: Pick<PlaybackAdGateState, "active">;
  hasActiveTrack: boolean;
  premiumActive: boolean;
}) => premiumActive && gate.active && hasActiveTrack;

export const getPlaybackAdGateControllerDecisions = ({
  hasActiveTrack,
  state,
  premiumActive,
}: {
  hasActiveTrack: boolean;
  state: { adGate: Pick<PlaybackAdGateState, "active" | "due"> };
  premiumActive: boolean;
}) => ({
  shouldBeginAdBreak: shouldStartPlaybackAdBreak({
    gate: {
      active: state.adGate.active,
      due: state.adGate.due,
    },
    premiumActive,
  }),
  shouldResumeAfterPremium: shouldResumePlaybackAfterPremium({
    gate: {
      active: state.adGate.active,
    },
    hasActiveTrack,
    premiumActive,
  }),
});

export type PlaybackAdGateControllerDecisions = ReturnType<
  typeof getPlaybackAdGateControllerDecisions
>;
