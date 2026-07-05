import { useMemo, useReducer } from "react";
import { usePremiumEntitlementSelector } from "@/src/features/premium/state/PremiumEntitlementProvider";
import { initialPlaybackState } from "../services/playback-initial-state-service";
import { getActiveTrack } from "../services/playback-queue-selection-service";
import { playbackReducer } from "../services/playback-session-service";
import {
  getPlaybackSessionValue,
  type PlaybackSessionValue,
} from "../services/playback-session-value-service";
import { usePlaybackCommandController } from "./use-playback-command-controller";
import { usePlaybackNativeLifecycle } from "./use-playback-native-lifecycle";
import { usePlaybackStateRef } from "./use-playback-state-ref";

export type { PlaybackSessionValue };

export function usePlaybackSessionStore(): PlaybackSessionValue {
  const premiumActive = usePremiumEntitlementSelector(
    (store) => store.state.active,
  );
  const [state, dispatch] = useReducer(playbackReducer, initialPlaybackState);
  const stateRef = usePlaybackStateRef(state);
  const activeTrack = useMemo(() => getActiveTrack(state), [state]);

  const {
    beginAdBreak,
    canRunPlaybackCommand,
    finishActiveTrack,
    runNativeCommandPlan,
  } = usePlaybackNativeLifecycle({
    activeTrack,
    dispatch,
    premiumActive,
    state,
    stateRef,
  });

  const commands = usePlaybackCommandController({
    beginAdBreak,
    canRunPlaybackCommand,
    dispatch,
    finishActiveTrack,
    runNativeCommandPlan,
    stateRef,
  });

  return useMemo<PlaybackSessionValue>(
    () => getPlaybackSessionValue({
      activeTrack,
      commands,
      state,
    }),
    [activeTrack, commands, state],
  );
}
