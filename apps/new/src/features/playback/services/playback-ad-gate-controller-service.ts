import { getBeginPlaybackAdBreakAction } from "./playback-ad-gate-service";
import { canRunPlaybackWithAdGate } from "./playback-ad-gate-decision-service";
import type { PlaybackAction } from "./playback-session-action-service";
import type { PlaybackAdGateState } from "../types/playback-state";

type CreatePlaybackAdGateControlsParams = {
  dispatch: (action: PlaybackAction) => void;
  getAdGate: () => Pick<PlaybackAdGateState, "active" | "due">;
  getPremiumActive: () => boolean;
  onBeginAdBreak: () => void;
};

export type PlaybackAdGateControls = {
  beginAdBreak: () => void;
  canRunPlaybackCommand: () => boolean;
};

export const createPlaybackAdGateControls = ({
  dispatch,
  getAdGate,
  getPremiumActive,
  onBeginAdBreak,
}: CreatePlaybackAdGateControlsParams): PlaybackAdGateControls => ({
  beginAdBreak: () => {
    dispatch(getBeginPlaybackAdBreakAction());
    onBeginAdBreak();
  },
  canRunPlaybackCommand: () =>
    canRunPlaybackWithAdGate({
      gate: getAdGate(),
      premiumActive: getPremiumActive(),
    }),
});
