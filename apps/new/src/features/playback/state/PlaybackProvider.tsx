import { useMemo, useReducer, type ReactNode } from "react";
import { createStore } from "rostra";
import { usePremiumEntitlementSelector } from "@/src/features/premium/state/PremiumEntitlementProvider";
import { usePlaybackAdGateController } from "../hooks/use-playback-ad-gate-controller";
import {
  usePlaybackCommandController,
  type PlaybackCommands,
} from "../hooks/use-playback-command-controller";
import { usePlaybackNativeAdapter } from "../hooks/use-playback-native-adapter";
import { usePlaybackNativeStatusListener } from "../hooks/use-playback-native-status-listener";
import { usePlaybackNativeCommandRunner } from "../hooks/use-playback-native-command-runner";
import { usePlaybackStateRef } from "../hooks/use-playback-state-ref";
import { usePlaybackTrackAdvancement } from "../hooks/use-playback-track-advancement";
import { getActiveTrack } from "../services/playback-queue-service";
import {
  initialPlaybackState,
  playbackReducer,
} from "../services/playback-session-service";
import { usePersistedPlaybackSession } from "../hooks/use-persisted-playback-session";
import type {
  PlaybackQueueItem,
  PlaybackState,
} from "../types/playback-state";

export type PlaybackSessionValue = PlaybackCommands & {
  activeTrack: PlaybackQueueItem | null;
  state: PlaybackState;
};

function usePlaybackSessionStore(): PlaybackSessionValue {
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

const { Store, useStore } = createStore<object, PlaybackSessionValue>(
  usePlaybackSessionStore,
);

export function PlaybackProvider({ children }: { children: ReactNode }) {
  return <Store>{children}</Store>;
}

export function usePlaybackSessionSelector<SelectedValue>(
  selector: (store: PlaybackSessionValue) => SelectedValue,
) {
  return useStore(selector);
}

export function usePlaybackSession() {
  return usePlaybackSessionSelector((store) => store);
}
