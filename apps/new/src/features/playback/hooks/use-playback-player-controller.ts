import { useHapticFeedback } from "@/src/features/settings/hooks/use-haptic-feedback";
import { getPlaybackPlayerViewState } from "../services/playback-player-state-service";
import { usePlaybackPlayerCommands } from "./use-playback-player-commands";
import { usePlaybackSessionSelector } from "./use-playback-session";

export function usePlaybackPlayerController() {
  const { sendHaptic } = useHapticFeedback();
  const activeTrack = usePlaybackSessionSelector((store) => store.activeTrack);
  const pause = usePlaybackSessionSelector((store) => store.pause);
  const resume = usePlaybackSessionSelector((store) => store.resume);
  const seekTo = usePlaybackSessionSelector((store) => store.seekTo);
  const skipNext = usePlaybackSessionSelector((store) => store.skipNext);
  const skipPrevious = usePlaybackSessionSelector(
    (store) => store.skipPrevious,
  );
  const state = usePlaybackSessionSelector((store) => store.state);
  const toggleLoop = usePlaybackSessionSelector((store) => store.toggleLoop);
  const toggleShuffle = usePlaybackSessionSelector(
    (store) => store.toggleShuffle,
  );
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
