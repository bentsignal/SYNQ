import { useCallback } from "react";
import { useHapticFeedback } from "@/src/features/settings/hooks/use-haptic-feedback";
import { getPlaybackQueueActionState } from "../services/playback-queue-service";
import type { PlaybackQueueItem } from "../types/playback-state";
import { usePlaybackSessionSelector } from "./use-playback-session";

export function usePlaybackQueueController() {
  const { sendHaptic } = useHapticFeedback();
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
  const actionState = getPlaybackQueueActionState({
    queueLength: state.queue.length,
  });

  const playQueuedSong = useCallback((song: PlaybackQueueItem) => {
    sendHaptic("light");
    playSong(song);
  }, [playSong, sendHaptic]);

  const removeQueuedSong = useCallback((songId: number) => {
    sendHaptic("medium");
    removeFromQueue(songId);
  }, [removeFromQueue, sendHaptic]);

  const moveQueuedSong = useCallback(
    (songId: number, direction: "down" | "up") => {
      sendHaptic("light");
      moveQueueSong(songId, direction);
    },
    [moveQueueSong, sendHaptic],
  );

  const clearQueuedSongs = useCallback(() => {
    sendHaptic("medium");
    clearQueue();
  }, [clearQueue, sendHaptic]);

  return {
    actionState,
    activeTrack,
    adBreakActive,
    clearQueuedSongs,
    moveQueuedSong,
    playQueuedSong,
    removeQueuedSong,
    state,
  };
}

export type PlaybackQueueController = ReturnType<
  typeof usePlaybackQueueController
>;
