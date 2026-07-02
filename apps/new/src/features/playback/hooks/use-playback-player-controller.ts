import { useHapticFeedback } from "@/src/features/settings/hooks/use-haptic-feedback";
import { getPlaybackPlayerViewState } from "../services/playback-player-state-service";
import { usePlaybackPlayerCommands } from "./use-playback-player-commands";
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
  const commands = usePlaybackPlayerCommands({
    pause,
    resume,
    seekTo,
    sendHaptic,
    skipNext,
    skipPrevious,
    state,
    toggleLoop,
    toggleShuffle,
  });

  return {
    actionState,
    activeTrack,
    adProgressPercent,
    freeListeningRemainingMs,
    progressPercent,
    state,
    ...commands,
  };
}

export type PlaybackPlayerController = ReturnType<
  typeof usePlaybackPlayerController
>;
