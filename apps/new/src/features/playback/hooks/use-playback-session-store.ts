import { useMemo, useReducer } from "react";
import { usePremiumEntitlementSelector } from "@/src/features/premium/state/PremiumEntitlementProvider";
import { initialPlaybackState } from "../services/playback-initial-state-service";
import { getActiveTrack } from "../services/playback-queue-service";
import { playbackReducer } from "../services/playback-session-service";
import type {
  PlaybackQueueItem,
  PlaybackState,
} from "../types/playback-state";
import { usePersistedPlaybackSession } from "./use-persisted-playback-session";
import { usePlaybackAdGateController } from "./use-playback-ad-gate-controller";
import {
  usePlaybackCommandController,
  type PlaybackCommands,
} from "./use-playback-command-controller";
import { usePlaybackNativeAdapter } from "./use-playback-native-adapter";
import { usePlaybackNativeCommandRunner } from "./use-playback-native-command-runner";
import { usePlaybackNativeStatusListener } from "./use-playback-native-status-listener";
import { usePlaybackStateRef } from "./use-playback-state-ref";
import { usePlaybackTrackAdvancement } from "./use-playback-track-advancement";

export type PlaybackSessionValue = PlaybackCommands & {
  activeTrack: PlaybackQueueItem | null;
  state: PlaybackState;
};

export function usePlaybackSessionStore(): PlaybackSessionValue {
  const premiumActive = usePremiumEntitlementSelector(
    (store) => store.state.active,
  );
  const [state, dispatch] = useReducer(playbackReducer, initialPlaybackState);
  const stateRef = usePlaybackStateRef(state);
  const adapter = usePlaybackNativeAdapter();
  const activeTrack = useMemo(() => getActiveTrack(state), [state]);

  const {
    playNativeAdBreak,
    restorePersistedPlaybackState,
    resumeNativeLibraryAfterPremium,
    runNativeCommand,
    runNativeCommandPlan,
  } = usePlaybackNativeCommandRunner({
    adapter,
    dispatch,
  });

  usePersistedPlaybackSession({
    dispatch,
    onRestorePlayingState: restorePersistedPlaybackState,
    state,
  });

  const {
    beginAdBreak,
    canRunPlaybackCommand,
    premiumActiveRef,
  } = usePlaybackAdGateController({
    activeTrack,
    dispatch,
    onBeginAdBreak: playNativeAdBreak,
    onResumeLibraryAfterPremium: resumeNativeLibraryAfterPremium,
    premiumActive,
    state,
    stateRef,
  });

  const finishActiveTrack = usePlaybackTrackAdvancement({
    adapter,
    beginAdBreak,
    canRunPlaybackCommand,
    dispatch,
    runNativeCommand,
    stateRef,
  });

  usePlaybackNativeStatusListener({
    adapter,
    dispatch,
    finishActiveTrack,
    premiumActiveRef,
    runNativeCommand,
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
    () => ({
      activeTrack,
      ...commands,
      state,
    }),
    [activeTrack, commands, state],
  );
}
