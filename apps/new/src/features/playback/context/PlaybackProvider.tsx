import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useReducer,
  useRef,
  type ReactNode,
} from "react";
import { usePremiumEntitlement } from "@/src/features/premium/context/PremiumEntitlementProvider";
import { usePlaybackAdGateController } from "../hooks/use-playback-ad-gate-controller";
import {
  usePlaybackCommandController,
  type PlaybackCommands,
} from "../hooks/use-playback-command-controller";
import { usePlaybackNativeStatusListener } from "../hooks/use-playback-native-status-listener";
import { usePlaybackNativeCommandRunner } from "../hooks/use-playback-native-command-runner";
import { usePlaybackTrackAdvancement } from "../hooks/use-playback-track-advancement";
import { getActiveTrack } from "../services/playback-queue-service";
import {
  initialPlaybackState,
  playbackReducer,
} from "../services/playback-session-service";
import { usePersistedPlaybackSession } from "../hooks/use-persisted-playback-session";
import { createExpoAudioTrackPlayerAdapter } from "../services/track-player-adapter";
import type {
  PlaybackQueueItem,
  PlaybackState,
} from "../types/playback-state";

type PlaybackSessionValue = PlaybackCommands & {
  activeTrack: PlaybackQueueItem | null;
  state: PlaybackState;
};

const PlaybackSessionContext = createContext<PlaybackSessionValue | null>(null);

export function PlaybackProvider({ children }: { children: ReactNode }) {
  const { state: premiumState } = usePremiumEntitlement();
  const [state, dispatch] = useReducer(playbackReducer, initialPlaybackState);
  const stateRef = useRef(state);
  const adapterRef = useRef(createExpoAudioTrackPlayerAdapter());
  const activeTrack = useMemo(() => getActiveTrack(state), [state]);

  useEffect(() => {
    stateRef.current = state;
  }, [state]);

  useEffect(
    () => () => {
      void adapterRef.current.destroy();
    },
    [],
  );

  const {
    playNativeAdBreak,
    restorePersistedPlaybackState,
    resumeNativeLibraryAfterPremium,
    runNativeCommand,
    runNativeCommandPlan,
  } = usePlaybackNativeCommandRunner({
    adapter: adapterRef.current,
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
    premiumActive: premiumState.active,
    state,
    stateRef,
  });

  const finishActiveTrack = usePlaybackTrackAdvancement({
    adapter: adapterRef.current,
    beginAdBreak,
    canRunPlaybackCommand,
    dispatch,
    runNativeCommand,
    stateRef,
  });

  usePlaybackNativeStatusListener({
    adapter: adapterRef.current,
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

  const value = useMemo<PlaybackSessionValue>(
    () => ({
      activeTrack,
      ...commands,
      state,
    }),
    [activeTrack, commands, state],
  );

  return (
    <PlaybackSessionContext.Provider value={value}>
      {children}
    </PlaybackSessionContext.Provider>
  );
}

export function usePlaybackSession() {
  const value = useContext(PlaybackSessionContext);

  if (!value) {
    throw new Error("usePlaybackSession must be used inside PlaybackProvider.");
  }

  return value;
}
