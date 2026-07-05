import type { RefObject } from "react";
import { getBeginPlaybackAdBreakAction } from "./playback-ad-gate-service";
import { canRunPlaybackWithAdGate } from "./playback-ad-gate-decision-service";
import type { PlaybackAction } from "./playback-session-action-service";
import type { PlaybackState } from "../types/playback-state";

type CreatePlaybackAdGateControlsParams = {
  dispatch: (action: PlaybackAction) => void;
  onBeginAdBreak: () => void;
  premiumActiveRef: RefObject<boolean>;
  stateRef: RefObject<PlaybackState>;
};

export type PlaybackAdGateControls = {
  beginAdBreak: () => void;
  canRunPlaybackCommand: () => boolean;
};

export const createPlaybackAdGateControls = ({
  dispatch,
  onBeginAdBreak,
  premiumActiveRef,
  stateRef,
}: CreatePlaybackAdGateControlsParams): PlaybackAdGateControls => ({
  beginAdBreak: () => {
    dispatch(getBeginPlaybackAdBreakAction());
    onBeginAdBreak();
  },
  canRunPlaybackCommand: () =>
    canRunPlaybackWithAdGate({
      gate: stateRef.current.adGate,
      premiumActive: premiumActiveRef.current,
    }),
});
