import { useMemo, useRef, type RefObject } from "react";
import type { PlaybackAction } from "../services/playback-session-action-service";
import type {
  PlaybackQueueItem,
  PlaybackState,
} from "../types/playback-state";
import {
  createPlaybackAdGateControls,
} from "../services/playback-ad-gate-controller-service";
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
