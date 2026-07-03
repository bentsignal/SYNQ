import { useCallback } from "react";
import type { HapticFeedbackType } from "@/src/features/settings/services/haptic-feedback-service";
import {
  runPlaybackPlayerButtonCommand,
  runPlaybackPlayerPlayPauseCommand,
  runPlaybackPlayerSeekCommand,
} from "../services/playback-player-command-flow-service";
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
    runPlaybackPlayerSeekCommand({
      direction: "backward",
      seekTo,
      sendHaptic,
      state: {
        duration: state.duration,
        position: state.position,
      },
    });
  }, [seekTo, sendHaptic, state.duration, state.position]);

  const fastForward = useCallback(() => {
    runPlaybackPlayerSeekCommand({
      direction: "forward",
      seekTo,
      sendHaptic,
      state: {
        duration: state.duration,
        position: state.position,
      },
    });
  }, [seekTo, sendHaptic, state.duration, state.position]);

  const skipBack = useCallback(() => {
    runPlaybackPlayerButtonCommand({
      action: skipPrevious,
      sendHaptic,
    });
  }, [sendHaptic, skipPrevious]);

  const togglePlayPause = useCallback(() => {
    runPlaybackPlayerPlayPauseCommand({
      isPlaying: state.isPlaying,
      pause,
      resume,
      sendHaptic,
    });
  }, [pause, resume, sendHaptic, state.isPlaying]);

  const skipForward = useCallback(() => {
    runPlaybackPlayerButtonCommand({
      action: skipNext,
      sendHaptic,
    });
  }, [sendHaptic, skipNext]);

  const toggleShuffleMode = useCallback(() => {
    runPlaybackPlayerButtonCommand({
      action: toggleShuffle,
      sendHaptic,
    });
  }, [sendHaptic, toggleShuffle]);

  const toggleLoopMode = useCallback(() => {
    runPlaybackPlayerButtonCommand({
      action: toggleLoop,
      sendHaptic,
    });
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
