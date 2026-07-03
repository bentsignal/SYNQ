import { useCallback } from "react";
import { useHapticFeedback } from "@/src/features/settings/hooks/use-haptic-feedback";
import {
  getPlaybackQueueClearCommand,
  getPlaybackQueueMoveCommand,
  getPlaybackQueuePlayCommand,
  getPlaybackQueueRemoveCommand,
} from "../services/playback-queue-command-state-service";
import type { PlaybackQueueItem } from "../types/playback-state";

type UsePlaybackQueueActionsParams = {
  clearQueue: () => void;
  moveQueueSong: (songId: number, direction: "down" | "up") => void;
  playSong: (song: PlaybackQueueItem) => void;
  removeFromQueue: (songId: number) => void;
};

export function usePlaybackQueueActions({
  clearQueue,
  moveQueueSong,
  playSong,
  removeFromQueue,
}: UsePlaybackQueueActionsParams) {
  const { sendHaptic } = useHapticFeedback();

  const playQueuedSong = useCallback(
    (song: PlaybackQueueItem) => {
      sendHaptic(getPlaybackQueuePlayCommand().haptic);
      playSong(song);
    },
    [playSong, sendHaptic],
  );

  const removeQueuedSong = useCallback(
    (songId: number) => {
      sendHaptic(getPlaybackQueueRemoveCommand().haptic);
      removeFromQueue(songId);
    },
    [removeFromQueue, sendHaptic],
  );

  const moveQueuedSong = useCallback(
    (songId: number, direction: "down" | "up") => {
      sendHaptic(getPlaybackQueueMoveCommand().haptic);
      moveQueueSong(songId, direction);
    },
    [moveQueueSong, sendHaptic],
  );

  const clearQueuedSongs = useCallback(() => {
    sendHaptic(getPlaybackQueueClearCommand().haptic);
    clearQueue();
  }, [clearQueue, sendHaptic]);

  return {
    clearQueuedSongs,
    moveQueuedSong,
    playQueuedSong,
    removeQueuedSong,
  };
}
