import { useCallback } from "react";
import { useHapticFeedback } from "@/src/features/settings/hooks/use-haptic-feedback";
import {
  getPlaybackPlayerViewState,
  getSeekTargetPosition,
} from "../services/playback-player-state-service";
import { usePlaybackSession } from "./use-playback-session";

export function usePlaybackPlayerController() {
  const { sendHaptic } = useHapticFeedback();
  const {
    activeTrack,
    pause,
    resume,
    seekTo,
    skipNext,
    skipPrevious,
    state,
    toggleLoop,
    toggleShuffle,
  } = usePlaybackSession();
  const {
    actionState,
    adProgressPercent,
    freeListeningRemainingMs,
    progressPercent,
  } = getPlaybackPlayerViewState({ activeTrack, state });

  const rewind = useCallback(() => {
    sendHaptic("light");
    seekTo(
      getSeekTargetPosition({
        direction: "backward",
        duration: state.duration,
        position: state.position,
      }),
    );
  }, [seekTo, sendHaptic, state.duration, state.position]);

  const fastForward = useCallback(() => {
    sendHaptic("light");
    seekTo(
      getSeekTargetPosition({
        direction: "forward",
        duration: state.duration,
        position: state.position,
      }),
    );
  }, [seekTo, sendHaptic, state.duration, state.position]);

  const skipBack = useCallback(() => {
    sendHaptic("light");
    skipPrevious();
  }, [sendHaptic, skipPrevious]);

  const togglePlayPause = useCallback(() => {
    sendHaptic(state.isPlaying ? "soft" : "light");
    if (state.isPlaying) {
      pause();
      return;
    }

    resume();
  }, [pause, resume, sendHaptic, state.isPlaying]);

  const skipForward = useCallback(() => {
    sendHaptic("light");
    skipNext();
  }, [sendHaptic, skipNext]);

  const toggleShuffleMode = useCallback(() => {
    sendHaptic("light");
    toggleShuffle();
  }, [sendHaptic, toggleShuffle]);

  const toggleLoopMode = useCallback(() => {
    sendHaptic("light");
    toggleLoop();
  }, [sendHaptic, toggleLoop]);

  return {
    actionState,
    activeTrack,
    adProgressPercent,
    fastForward,
    freeListeningRemainingMs,
    progressPercent,
    rewind,
    skipBack,
    skipForward,
    state,
    toggleLoopMode,
    togglePlayPause,
    toggleShuffleMode,
  };
}

export type PlaybackPlayerController = ReturnType<
  typeof usePlaybackPlayerController
>;
