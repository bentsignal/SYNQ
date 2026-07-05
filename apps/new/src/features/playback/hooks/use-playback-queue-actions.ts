import { useMemo } from "react";
import { useHapticFeedback } from "@/src/features/settings/hooks/use-haptic-feedback";
import {
  createPlaybackQueueActions,
} from "../services/playback-queue-action-service";
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

  return useMemo(
    () =>
      createPlaybackQueueActions({
        clearQueue,
        moveQueueSong,
        playSong,
        removeFromQueue,
        sendHaptic,
      }),
    [clearQueue, moveQueueSong, playSong, removeFromQueue, sendHaptic],
  );
}
