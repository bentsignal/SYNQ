import { useCallback, useEffect, useRef } from "react";
import type { PlaybackAction } from "../services/playback-session-action-service";
import type {
  PlaybackQueueItem,
  PlaybackState,
} from "../types/playback-state";
import {
  canRunPlaybackWithAdGate,
  getBeginPlaybackAdBreakAction,
  getSyncPlaybackPremiumAction,
  shouldResumePlaybackAfterPremium,
  shouldStartPlaybackAdBreak,
} from "../services/playback-ad-gate-service";

export function usePlaybackAdGateController({
  activeTrack,
  dispatch,
  onBeginAdBreak,
  onResumeLibraryAfterPremium,
  premiumActive,
  stateRef,
  state,
}: {
  activeTrack: PlaybackQueueItem | null;
  dispatch: (action: PlaybackAction) => void;
  onBeginAdBreak: () => void;
  onResumeLibraryAfterPremium: () => void;
  premiumActive: boolean;
  state: PlaybackState;
  stateRef: React.RefObject<PlaybackState>;
}) {
  const premiumActiveRef = useRef(premiumActive);

  useEffect(() => {
    premiumActiveRef.current = premiumActive;
    dispatch(getSyncPlaybackPremiumAction(premiumActive));
  }, [dispatch, premiumActive]);

  const beginAdBreak = useCallback(() => {
    dispatch(getBeginPlaybackAdBreakAction());
    onBeginAdBreak();
  }, [dispatch, onBeginAdBreak]);

  const canRunPlaybackCommand = useCallback(() => {
    const adGate = stateRef.current.adGate;

    return canRunPlaybackWithAdGate({
      gate: adGate,
      premiumActive: premiumActiveRef.current,
    });
  }, [stateRef]);

  const adGateActive = state.adGate.active;
  const adGateDue = state.adGate.due;

  useEffect(() => {
    if (
      shouldStartPlaybackAdBreak({
        gate: { active: adGateActive, due: adGateDue },
        premiumActive,
      })
    ) {
      beginAdBreak();
    }
  }, [adGateActive, adGateDue, beginAdBreak, premiumActive]);

  useEffect(() => {
    if (
      shouldResumePlaybackAfterPremium({
        gate: { active: adGateActive },
        hasActiveTrack: activeTrack !== null,
        premiumActive,
      })
    ) {
      onResumeLibraryAfterPremium();
    }
  }, [activeTrack, adGateActive, onResumeLibraryAfterPremium, premiumActive]);

  return {
    beginAdBreak,
    canRunPlaybackCommand,
    premiumActiveRef,
  };
}
