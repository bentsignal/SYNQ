import { useEffect, useMemo, useRef } from "react";
import type { PlaybackAction } from "../services/playback-session-action-service";
import type {
  PlaybackQueueItem,
  PlaybackState,
} from "../types/playback-state";
import {
  getPlaybackAdGateControllerDecisions,
  getSyncPlaybackPremiumAction,
} from "../services/playback-ad-gate-service";
import {
  createPlaybackAdGateControls,
} from "../services/playback-ad-gate-controller-service";

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

  const { beginAdBreak, canRunPlaybackCommand } = useMemo(
    () =>
      createPlaybackAdGateControls({
        dispatch,
        onBeginAdBreak,
        premiumActiveRef,
        stateRef,
      }),
    [dispatch, onBeginAdBreak, stateRef],
  );

  const adGateActive = state.adGate.active;
  const adGateDue = state.adGate.due;
  const { shouldBeginAdBreak, shouldResumeAfterPremium } =
    getPlaybackAdGateControllerDecisions({
      hasActiveTrack: activeTrack !== null,
      premiumActive,
      state,
    });

  useEffect(() => {
    if (shouldBeginAdBreak) {
      beginAdBreak();
    }
  }, [adGateActive, adGateDue, beginAdBreak, premiumActive, shouldBeginAdBreak]);

  useEffect(() => {
    if (shouldResumeAfterPremium) {
      onResumeLibraryAfterPremium();
    }
  }, [
    activeTrack,
    adGateActive,
    onResumeLibraryAfterPremium,
    premiumActive,
    shouldResumeAfterPremium,
  ]);

  return {
    beginAdBreak,
    canRunPlaybackCommand,
    premiumActiveRef,
  };
}
