import {
  getClearQueuePlaybackCommandPlan,
  getRemoveFromQueuePlaybackCommandPlan,
  getToggleLoopPlaybackCommandPlan,
  getToggleShufflePlaybackCommandPlan,
  type PlaybackCommandPlan,
} from "./playback-command-plan-service";
import {
  getAddPlaybackQueueSongAction,
  getMovePlaybackQueueSongAction,
  type PlaybackAction,
} from "./playback-session-action-service";
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
  dispatch(getAddPlaybackQueueSongAction(song));
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
  dispatch(getMovePlaybackQueueSongAction({ direction, songId }));
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
  runCommandPlan,
  state,
}: Pick<PlaybackQueueSessionCommandDependencies, "runCommandPlan"> & {
  state: PlaybackState;
}) => {
  runCommandPlan(getToggleLoopPlaybackCommandPlan(state));
};

export const runPlaybackQueueToggleShuffleCommand = ({
  runCommandPlan,
  state,
}: Pick<PlaybackQueueSessionCommandDependencies, "runCommandPlan"> & {
  state: PlaybackState;
}) => {
  runCommandPlan(getToggleShufflePlaybackCommandPlan(state));
};
