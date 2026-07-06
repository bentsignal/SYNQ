import type { RefObject } from "react";
import type { PlaybackNativeCommandPlan } from "../services/playback-native-command-plan-service";
import type { PlaybackAction } from "../services/playback-session-action-service";
import type {
  PlaybackQueueItem,
  PlaybackState,
} from "../types/playback-state";
import { usePersistedPlaybackSession } from "./use-persisted-playback-session";
import { usePlaybackAdGateController } from "./use-playback-ad-gate-controller";
import { usePlaybackNativeAdapter } from "./use-playback-native-adapter";
import { usePlaybackNativeCommandRunner } from "./use-playback-native-command-runner";
import { usePlaybackNativeStatusListener } from "./use-playback-native-status-listener";
import { usePlaybackTrackAdvancement } from "./use-playback-track-advancement";
import type { TrackPlayerAdapter } from "../services/track-player-adapter";

type UsePlaybackNativeLifecycleParams = {
  activeTrack: PlaybackQueueItem | null;
  dispatch: (action: PlaybackAction) => void;
  premiumActive: boolean;
  state: PlaybackState;
  stateRef: RefObject<PlaybackState>;
};

export type PlaybackNativeLifecycle = {
  beginAdBreak: () => void;
  canRunPlaybackCommand: () => boolean;
  finishActiveTrack: () => void;
  runNativeCommandPlan: (plan: PlaybackNativeCommandPlan) => void;
  setRemoteCommandListener: TrackPlayerAdapter["setRemoteCommandListener"];
};

export function usePlaybackNativeLifecycle({
  activeTrack,
  dispatch,
  premiumActive,
  state,
  stateRef,
}: UsePlaybackNativeLifecycleParams): PlaybackNativeLifecycle {
  const adapter = usePlaybackNativeAdapter();
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

  return {
    beginAdBreak,
    canRunPlaybackCommand,
    finishActiveTrack,
    runNativeCommandPlan,
    setRemoteCommandListener: adapter.setRemoteCommandListener,
  };
}
