import type { HapticFeedbackType } from "../../settings/services/haptic-feedback-service";
import type { PlaybackQueueItem } from "../types/playback-state";
import {
  runPlaybackQueueClearCommand,
  runPlaybackQueueMoveCommand,
  runPlaybackQueuePlayCommand,
  runPlaybackQueueRemoveCommand,
} from "./playback-queue-command-flow-service";

type CreatePlaybackQueueActionsParams = {
  clearQueue: () => void;
  moveQueueSong: (songId: number, direction: "down" | "up") => void;
  playSong: (song: PlaybackQueueItem) => void;
  removeFromQueue: (songId: number) => void;
  sendHaptic: (type: HapticFeedbackType) => void;
};

export type PlaybackQueueActions = {
  clearQueuedSongs: () => void;
  moveQueuedSong: (songId: number, direction: "down" | "up") => void;
  playQueuedSong: (song: PlaybackQueueItem) => void;
  removeQueuedSong: (songId: number) => void;
};

export const createPlaybackQueueActions = ({
  clearQueue,
  moveQueueSong,
  playSong,
  removeFromQueue,
  sendHaptic,
}: CreatePlaybackQueueActionsParams): PlaybackQueueActions => ({
  clearQueuedSongs: () => {
    runPlaybackQueueClearCommand({
      clearQueue,
      sendHaptic,
    });
  },
  moveQueuedSong: (songId, direction) => {
    runPlaybackQueueMoveCommand({
      direction,
      moveQueueSong,
      sendHaptic,
      songId,
    });
  },
  playQueuedSong: (song) => {
    runPlaybackQueuePlayCommand({
      playSong,
      sendHaptic,
      song,
    });
  },
  removeQueuedSong: (songId) => {
    runPlaybackQueueRemoveCommand({
      removeFromQueue,
      sendHaptic,
      songId,
    });
  },
});
