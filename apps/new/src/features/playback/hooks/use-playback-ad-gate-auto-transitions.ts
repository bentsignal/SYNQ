import { useEffect } from "react";
import type {
  PlaybackQueueItem,
  PlaybackState,
} from "../types/playback-state";
import { getPlaybackAdGateControllerDecisions } from "../services/playback-ad-gate-decision-service";

type UsePlaybackAdGateAutoTransitionsParams = {
  activeTrack: PlaybackQueueItem | null;
  beginAdBreak: () => void;
  onResumeLibraryAfterPremium: () => void;
  premiumActive: boolean;
  state: PlaybackState;
};

export function usePlaybackAdGateAutoTransitions({
  activeTrack,
  beginAdBreak,
  onResumeLibraryAfterPremium,
  premiumActive,
  state,
}: UsePlaybackAdGateAutoTransitionsParams) {
  const { active: adGateActive, due: adGateDue } = state.adGate;
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
}
