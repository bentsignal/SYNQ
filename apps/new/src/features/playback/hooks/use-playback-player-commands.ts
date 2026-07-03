import { useCallback } from "react";
import type { HapticFeedbackType } from "@/src/features/settings/services/haptic-feedback-service";
import {
  getPlaybackPlayerButtonCommand,
  getPlaybackPlayerPlayPauseCommand,
  getPlaybackPlayerSeekCommand,
} from "../services/playback-player-command-state-service";
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
    const command = getPlaybackPlayerSeekCommand({
      direction: "backward",
      state: {
        duration: state.duration,
        position: state.position,
      },
    });
    sendHaptic(command.haptic);
    seekTo(command.targetPosition);
  }, [seekTo, sendHaptic, state.duration, state.position]);

  const fastForward = useCallback(() => {
    const command = getPlaybackPlayerSeekCommand({
      direction: "forward",
      state: {
        duration: state.duration,
        position: state.position,
      },
    });
    sendHaptic(command.haptic);
    seekTo(command.targetPosition);
  }, [seekTo, sendHaptic, state.duration, state.position]);

  const skipBack = useCallback(() => {
    sendHaptic(getPlaybackPlayerButtonCommand().haptic);
    skipPrevious();
  }, [sendHaptic, skipPrevious]);

  const togglePlayPause = useCallback(() => {
    const command = getPlaybackPlayerPlayPauseCommand({
      isPlaying: state.isPlaying,
    });
    sendHaptic(command.haptic);
    if (command.action === "pause") {
      pause();
      return;
    }

    resume();
  }, [pause, resume, sendHaptic, state.isPlaying]);

  const skipForward = useCallback(() => {
    sendHaptic(getPlaybackPlayerButtonCommand().haptic);
    skipNext();
  }, [sendHaptic, skipNext]);

  const toggleShuffleMode = useCallback(() => {
    sendHaptic(getPlaybackPlayerButtonCommand().haptic);
    toggleShuffle();
  }, [sendHaptic, toggleShuffle]);

  const toggleLoopMode = useCallback(() => {
    sendHaptic(getPlaybackPlayerButtonCommand().haptic);
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
