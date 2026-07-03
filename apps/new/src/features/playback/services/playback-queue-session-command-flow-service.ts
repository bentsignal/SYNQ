import {
  getClearQueuePlaybackCommandPlan,
  getRemoveFromQueuePlaybackCommandPlan,
  type PlaybackCommandPlan,
} from "./playback-command-plan-service";
import type { PlaybackAction } from "./playback-session-service";
import type {
  PlaybackQueueItem,
  PlaybackState,
} from "../types/playback-state";

type PlaybackQueueSessionCommandDependencies = {
  dispatch: (action: PlaybackAction) => void;
  runCommandPlan: (plan: PlaybackCommandPlan) => void;
};

export const runPlaybackQueueAddSongCommand = ({
  dispatch,
  song,
}: Pick<PlaybackQueueSessionCommandDependencies, "dispatch"> & {
  song: PlaybackQueueItem;
}) => {
  dispatch({ song, type: "add-to-queue" });
};

export const runPlaybackQueueClearSessionCommand = ({
  runCommandPlan,
}: Pick<PlaybackQueueSessionCommandDependencies, "runCommandPlan">) => {
  runCommandPlan(getClearQueuePlaybackCommandPlan());
};

export const runPlaybackQueueMoveSongCommand = ({
  direction,
  dispatch,
  songId,
}: Pick<PlaybackQueueSessionCommandDependencies, "dispatch"> & {
  direction: "down" | "up";
  songId: number;
}) => {
  dispatch({ direction, songId, type: "move-queue-song" });
};

export const runPlaybackQueueRemoveSongCommand = ({
  runCommandPlan,
  songId,
  state,
}: Pick<PlaybackQueueSessionCommandDependencies, "runCommandPlan"> & {
  songId: number;
  state: PlaybackState;
}) => {
  runCommandPlan(
    getRemoveFromQueuePlaybackCommandPlan({
      songId,
      state,
    }),
  );
};

export const runPlaybackQueueToggleLoopCommand = ({
  dispatch,
}: Pick<PlaybackQueueSessionCommandDependencies, "dispatch">) => {
  dispatch({ type: "toggle-loop" });
};

export const runPlaybackQueueToggleShuffleCommand = ({
  dispatch,
}: Pick<PlaybackQueueSessionCommandDependencies, "dispatch">) => {
  dispatch({ type: "toggle-shuffle" });
};
