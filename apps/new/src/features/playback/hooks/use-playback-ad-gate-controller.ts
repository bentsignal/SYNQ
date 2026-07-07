import { useCallback, useRef, type RefObject } from "react";
import type { PlaybackAction } from "../services/playback-session-action-service";
import type {
  PlaybackQueueItem,
  PlaybackState,
} from "../types/playback-state";
import { getBeginPlaybackAdBreakAction } from "../services/playback-ad-gate-service";
import { canRunPlaybackWithAdGate } from "../services/playback-ad-gate-decision-service";
import { usePlaybackAdGateAutoTransitions } from "./use-playback-ad-gate-auto-transitions";
import { usePlaybackPremiumGateSync } from "./use-playback-premium-gate-sync";

type UsePlaybackAdGateControllerParams = {
  activeTrack: PlaybackQueueItem | null;
  dispatch: (action: PlaybackAction) => void;
  onBeginAdBreak: () => void;
  onResumeLibraryAfterPremium: () => void;
  premiumActive: boolean;
  state: PlaybackState;
  stateRef: RefObject<PlaybackState>;
};

export function usePlaybackAdGateController({
  activeTrack,
  dispatch,
  onBeginAdBreak,
  onResumeLibraryAfterPremium,
  premiumActive,
  stateRef,
  state,
}: UsePlaybackAdGateControllerParams) {
  const premiumActiveRef = useRef(premiumActive);

  usePlaybackPremiumGateSync({
    dispatch,
    premiumActive,
    premiumActiveRef,
  });

  const beginAdBreak = useCallback(() => {
    dispatch(getBeginPlaybackAdBreakAction());
    onBeginAdBreak();
  }, [dispatch, onBeginAdBreak]);
  const canRunPlaybackCommand = useCallback(
    () =>
      canRunPlaybackWithAdGate({
        gate: stateRef.current.adGate,
        premiumActive: premiumActiveRef.current,
      }),
    [stateRef],
  );

  usePlaybackAdGateAutoTransitions({
    activeTrack,
    beginAdBreak,
    onResumeLibraryAfterPremium,
    premiumActive,
    state,
  });

  return {
    beginAdBreak,
    canRunPlaybackCommand,
    premiumActiveRef,
  };
}
