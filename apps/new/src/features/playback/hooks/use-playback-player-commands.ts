import { useCallback } from "react";
import type { HapticFeedbackType } from "@/src/features/settings/services/haptic-feedback-service";
import { getSeekTargetPosition } from "../services/playback-player-state-service";
import type { PlaybackState } from "../types/playback-state";

type PlaybackPlayerSessionCommands = {
  pause: () => void;
  resume: () => void;
  seekTo: (position: number) => void;
  skipNext: () => void;
  skipPrevious: () => void;
  toggleLoop: () => void;
  toggleShuffle: () => void;
};

export function usePlaybackPlayerCommands({
  pause,
  resume,
  seekTo,
  sendHaptic,
  skipNext,
  skipPrevious,
  state,
  toggleLoop,
  toggleShuffle,
}: PlaybackPlayerSessionCommands & {
  sendHaptic: (type: HapticFeedbackType) => void;
  state: Pick<PlaybackState, "duration" | "isPlaying" | "position">;
}) {
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
    fastForward,
    rewind,
    skipBack,
    skipForward,
    toggleLoopMode,
    togglePlayPause,
    toggleShuffleMode,
  };
}
