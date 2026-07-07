import type {
  PlaybackQueueItem,
  PlaybackState,
} from "../types/playback-state";
import {
  getPausePlaybackCommandPlan,
  getPlaySongPlaybackCommandPlan,
  getResumePlaybackCommandPlan,
  getSeekToPlaybackCommandPlan,
  getSkipNextPlaybackCommandPlan,
  getSkipPreviousPlaybackCommandPlan,
  type PlaybackCommandPlan,
} from "./playback-command-plan-service";

type PlaybackTransportCommandDependencies = {
  runAdGatedCommand: (command: () => void) => void;
  runCommandPlan: (plan: PlaybackCommandPlan) => void;
};

export const runPlaybackTransportPlaySongCommand = ({
  runAdGatedCommand,
  runCommandPlan,
  song,
  state,
}: PlaybackTransportCommandDependencies & {
  song: PlaybackQueueItem;
  state: PlaybackState;
}) => {
  runAdGatedCommand(() => {
    runCommandPlan(getPlaySongPlaybackCommandPlan({ song, state }));
  });
};

export const runPlaybackTransportPauseCommand = ({
  runCommandPlan,
}: Pick<PlaybackTransportCommandDependencies, "runCommandPlan">) => {
  runCommandPlan(getPausePlaybackCommandPlan());
};

export const runPlaybackTransportResumeCommand = ({
  runAdGatedCommand,
  runCommandPlan,
  state,
}: PlaybackTransportCommandDependencies & {
  state: PlaybackState;
}) => {
  runAdGatedCommand(() => {
    runCommandPlan(getResumePlaybackCommandPlan(state));
  });
};

export const runPlaybackTransportSeekCommand = ({
  position,
  runAdGatedCommand,
  runCommandPlan,
}: PlaybackTransportCommandDependencies & {
  position: number;
}) => {
  runAdGatedCommand(() => {
    runCommandPlan(getSeekToPlaybackCommandPlan(position));
  });
};

export const runPlaybackTransportSkipNextCommand = ({
  runAdGatedCommand,
  runCommandPlan,
  state,
}: PlaybackTransportCommandDependencies & {
  state: PlaybackState;
}) => {
  runAdGatedCommand(() => {
    runCommandPlan(getSkipNextPlaybackCommandPlan(state));
  });
};

export const runPlaybackTransportSkipPreviousCommand = ({
  runAdGatedCommand,
  runCommandPlan,
  state,
}: PlaybackTransportCommandDependencies & {
  state: PlaybackState;
}) => {
  runAdGatedCommand(() => {
    runCommandPlan(getSkipPreviousPlaybackCommandPlan(state));
  });
};
