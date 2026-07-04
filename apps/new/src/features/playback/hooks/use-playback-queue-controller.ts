import { getPlaybackQueueViewState } from "../services/playback-screen-state-service";
import { usePlaybackQueueActions } from "./use-playback-queue-actions";
import { usePlaybackSessionSelector } from "./use-playback-session";

export function usePlaybackQueueController() {
  const activeTrack = usePlaybackSessionSelector((store) => store.activeTrack);
  const clearQueue = usePlaybackSessionSelector((store) => store.clearQueue);
  const moveQueueSong = usePlaybackSessionSelector(
    (store) => store.moveQueueSong,
  );
  const playSong = usePlaybackSessionSelector((store) => store.playSong);
  const removeFromQueue = usePlaybackSessionSelector(
    (store) => store.removeFromQueue,
  );
  const state = usePlaybackSessionSelector((store) => store.state);
  const adBreakActive = state.adGate.active || state.adGate.due;
  const { actionState, screenState } = getPlaybackQueueViewState({
    queueLength: state.queue.length,
  });
  const {
    clearQueuedSongs,
    moveQueuedSong,
    playQueuedSong,
    removeQueuedSong,
  } = usePlaybackQueueActions({
    clearQueue,
    moveQueueSong,
    playSong,
    removeFromQueue,
  });

  return {
    actionState,
    activeTrack,
    adBreakActive,
    clearQueuedSongs,
    moveQueuedSong,
    playQueuedSong,
    removeQueuedSong,
    screenState,
    state,
  };
}

export type PlaybackQueueController = ReturnType<
  typeof usePlaybackQueueController
>;
