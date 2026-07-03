import { useCallback, useEffect, useRef } from "react";
import type { PlaybackAction } from "../services/playback-session-action-service";
import type {
  PlaybackQueueItem,
  PlaybackState,
} from "../types/playback-state";
import {
  getBeginPlaybackAdBreakAction,
  getSyncPlaybackPremiumAction,
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

    return premiumActiveRef.current || (!adGate.active && !adGate.due);
  }, [stateRef]);

  useEffect(() => {
    if (state.adGate.due && !state.adGate.active && !premiumActive) {
      beginAdBreak();
    }
  }, [beginAdBreak, premiumActive, state.adGate.active, state.adGate.due]);

  useEffect(() => {
    if (premiumActive && state.adGate.active && activeTrack) {
      onResumeLibraryAfterPremium();
    }
  }, [
    activeTrack,
    onResumeLibraryAfterPremium,
    premiumActive,
    state.adGate.active,
  ]);

  return {
    beginAdBreak,
    canRunPlaybackCommand,
    premiumActiveRef,
  };
}
