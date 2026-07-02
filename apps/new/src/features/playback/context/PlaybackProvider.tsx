import {
  createContext,
  useCallback,
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
import {
  getActiveTrack,
  getNextQueueIndex,
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

const getErrorMessage = (error: unknown) =>
  error instanceof Error ? error.message : "Playback command failed.";

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

  const runNativeCommand = useCallback((command: () => Promise<void>) => {
    void command().catch((error) => {
      dispatch({ error: getErrorMessage(error), type: "native-failure" });
    });
  }, []);

  const restorePersistedPlaybackState = useCallback(
    (persistedState: PlaybackState) => {
      runNativeCommand(() => adapterRef.current.restore(persistedState));
    },
    [runNativeCommand],
  );

  usePersistedPlaybackSession({
    dispatch,
    onRestorePlayingState: restorePersistedPlaybackState,
    state,
  });

  const playNativeAdBreak = useCallback(() => {
    runNativeCommand(() => adapterRef.current.playAd());
  }, [runNativeCommand]);
  const resumeNativeLibraryAfterPremium = useCallback(() => {
    runNativeCommand(() => adapterRef.current.resumeLibrary());
  }, [runNativeCommand]);
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

  const finishActiveTrack = useCallback(() => {
    if (!canRunPlaybackCommand()) {
      beginAdBreak();
      return;
    }

    const targetIndex = getNextQueueIndex({
      activeQueueIndex: stateRef.current.activeQueueIndex,
      loop: stateRef.current.mode.loop,
      queue: stateRef.current.queue,
      shuffle: stateRef.current.mode.shuffle,
    });
    const targetTrack =
      targetIndex === null ? null : stateRef.current.queue[targetIndex] ?? null;

    dispatch({ targetIndex, type: "native-finished" });
    if (targetTrack) {
      runNativeCommand(() => adapterRef.current.play(targetTrack));
    }
  }, [beginAdBreak, canRunPlaybackCommand, runNativeCommand]);

  usePlaybackNativeStatusListener({
    adapter: adapterRef.current,
    dispatch,
    finishActiveTrack,
    premiumActiveRef,
    runNativeCommand,
  });

  const commands = usePlaybackCommandController({
    adapter: adapterRef.current,
    beginAdBreak,
    canRunPlaybackCommand,
    dispatch,
    finishActiveTrack,
    runNativeCommand,
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
