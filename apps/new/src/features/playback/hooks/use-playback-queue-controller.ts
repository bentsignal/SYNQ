import { useCallback } from "react";
import { useHapticFeedback } from "@/src/features/settings/hooks/use-haptic-feedback";
import { getPlaybackQueueActionState } from "../services/playback-session-service";
import type { PlaybackQueueItem } from "../types/playback-state";
import { usePlaybackSession } from "./use-playback-session";

export function usePlaybackQueueController() {
  const { sendHaptic } = useHapticFeedback();
  const {
    activeTrack,
    clearQueue,
    moveQueueSong,
    playSong,
    removeFromQueue,
    state,
  } = usePlaybackSession();
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
