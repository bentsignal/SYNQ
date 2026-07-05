import { useCallback, useMemo } from "react";
import type { HapticFeedbackType } from "@/src/features/settings/services/haptic-feedback-service";
import {
  createPlaybackPlayerCommands,
  type PlaybackPlayerCommands,
} from "../services/playback-player-command-service";
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
}): PlaybackPlayerCommands {
  const getState = useCallback(
    () => ({
      duration: state.duration,
      isPlaying: state.isPlaying,
      position: state.position,
    }),
    [state.duration, state.isPlaying, state.position],
  );

  return useMemo(
    () => createPlaybackPlayerCommands({
      getState,
      pause,
      resume,
      seekTo,
      sendHaptic,
      skipNext,
      skipPrevious,
      toggleLoop,
      toggleShuffle,
    }),
    [
      getState,
      pause,
      resume,
      seekTo,
      sendHaptic,
      skipNext,
      skipPrevious,
      toggleLoop,
      toggleShuffle,
    ],
  );
}
