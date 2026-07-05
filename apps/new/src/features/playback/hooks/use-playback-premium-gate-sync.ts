import { useEffect, type RefObject } from "react";
import { getSyncPlaybackPremiumAction } from "../services/playback-ad-gate-service";
import type { PlaybackAction } from "../services/playback-session-action-service";

type UsePlaybackPremiumGateSyncParams = {
  dispatch: (action: PlaybackAction) => void;
  premiumActive: boolean;
  premiumActiveRef: RefObject<boolean>;
};

export function usePlaybackPremiumGateSync({
  dispatch,
  premiumActive,
  premiumActiveRef,
}: UsePlaybackPremiumGateSyncParams) {
  useEffect(() => {
    premiumActiveRef.current = premiumActive;
    dispatch(getSyncPlaybackPremiumAction(premiumActive));
  }, [dispatch, premiumActive, premiumActiveRef]);
}
