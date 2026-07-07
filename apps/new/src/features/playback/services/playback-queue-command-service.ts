import type { PlaybackCommandPlan } from "./playback-command-plan-service";
import type { PlaybackAction } from "./playback-session-action-service";
import type {
  PlaybackQueueItem,
  PlaybackState,
} from "../types/playback-state";
import {
  runPlaybackQueueAddSongCommand,
  runPlaybackQueueClearSessionCommand,
  runPlaybackQueueMoveSongCommand,
  runPlaybackQueueRemoveSongCommand,
  runPlaybackQueueToggleLoopCommand,
  runPlaybackQueueToggleShuffleCommand,
} from "./playback-queue-session-command-flow-service";

export type PlaybackQueueCommands = {
  addToQueue: (song: PlaybackQueueItem) => void;
  clearQueue: () => void;
  moveQueueSong: (songId: number, direction: "down" | "up") => void;
  removeFromQueue: (songId: number) => void;
  toggleLoop: () => void;
  toggleShuffle: () => void;
};

type CreatePlaybackQueueCommandsParams = {
  dispatch: (action: PlaybackAction) => void;
  getState: () => PlaybackState;
  runCommandPlan: (plan: PlaybackCommandPlan) => void;
};

export const createPlaybackQueueCommands = ({
  dispatch,
  getState,
  runCommandPlan,
}: CreatePlaybackQueueCommandsParams): PlaybackQueueCommands => ({
  addToQueue: (song) => {
    runPlaybackQueueAddSongCommand({ dispatch, song });
  },
  clearQueue: () => {
    runPlaybackQueueClearSessionCommand({ runCommandPlan });
  },
  moveQueueSong: (songId, direction) => {
    runPlaybackQueueMoveSongCommand({ direction, dispatch, songId });
  },
  removeFromQueue: (songId) => {
    runPlaybackQueueRemoveSongCommand({
      runCommandPlan,
      songId,
      state: getState(),
    });
  },
  toggleLoop: () => {
    runPlaybackQueueToggleLoopCommand({
      runCommandPlan,
      state: getState(),
    });
  },
  toggleShuffle: () => {
    runPlaybackQueueToggleShuffleCommand({
      runCommandPlan,
      state: getState(),
    });
  },
});
