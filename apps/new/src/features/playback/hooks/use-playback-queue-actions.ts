import { useCallback } from "react";
import { useHapticFeedback } from "@/src/features/settings/hooks/use-haptic-feedback";
import {
  runPlaybackQueueClearCommand,
  runPlaybackQueueMoveCommand,
  runPlaybackQueuePlayCommand,
  runPlaybackQueueRemoveCommand,
} from "../services/playback-queue-command-flow-service";
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
      runPlaybackQueuePlayCommand({
        playSong,
        sendHaptic,
        song,
      });
    },
    [playSong, sendHaptic],
  );

  const removeQueuedSong = useCallback(
    (songId: number) => {
      runPlaybackQueueRemoveCommand({
        removeFromQueue,
        sendHaptic,
        songId,
      });
    },
    [removeFromQueue, sendHaptic],
  );

  const moveQueuedSong = useCallback(
    (songId: number, direction: "down" | "up") => {
      runPlaybackQueueMoveCommand({
        direction,
        moveQueueSong,
        sendHaptic,
        songId,
      });
    },
    [moveQueueSong, sendHaptic],
  );

  const clearQueuedSongs = useCallback(() => {
    runPlaybackQueueClearCommand({
      clearQueue,
      sendHaptic,
    });
  }, [clearQueue, sendHaptic]);

  return {
    clearQueuedSongs,
    moveQueuedSong,
    playQueuedSong,
    removeQueuedSong,
  };
}
