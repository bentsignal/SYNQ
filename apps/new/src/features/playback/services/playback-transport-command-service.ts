import type { PlaybackCommandPlan } from "./playback-command-plan-service";
import {
  runPlaybackTransportPauseCommand,
  runPlaybackTransportPlaySongCommand,
  runPlaybackTransportResumeCommand,
  runPlaybackTransportSeekCommand,
  runPlaybackTransportSkipNextCommand,
  runPlaybackTransportSkipPreviousCommand,
} from "./playback-transport-command-flow-service";
import type {
  PlaybackQueueItem,
  PlaybackState,
} from "../types/playback-state";

type CreatePlaybackTransportCommandsParams = {
  getState: () => PlaybackState;
  runAdGatedCommand: (command: () => void) => void;
  runCommandPlan: (plan: PlaybackCommandPlan) => void;
};

export type PlaybackTransportCommands = {
  pause: () => void;
  playSong: (song: PlaybackQueueItem) => void;
  resume: () => void;
  seekTo: (position: number) => void;
  skipNext: () => void;
  skipPrevious: () => void;
};

export const createPlaybackTransportCommands = ({
  getState,
  runAdGatedCommand,
  runCommandPlan,
}: CreatePlaybackTransportCommandsParams): PlaybackTransportCommands => ({
  pause: () => {
    runPlaybackTransportPauseCommand({ runCommandPlan });
  },
  playSong: (song) => {
    runPlaybackTransportPlaySongCommand({
      runAdGatedCommand,
      runCommandPlan,
      song,
    });
  },
  resume: () => {
    runPlaybackTransportResumeCommand({
      runAdGatedCommand,
      runCommandPlan,
      state: getState(),
    });
  },
  seekTo: (position) => {
    runPlaybackTransportSeekCommand({
      position,
      runAdGatedCommand,
      runCommandPlan,
    });
  },
  skipNext: () => {
    runPlaybackTransportSkipNextCommand({
      runAdGatedCommand,
      runCommandPlan,
      state: getState(),
    });
  },
  skipPrevious: () => {
    runPlaybackTransportSkipPreviousCommand({
      runAdGatedCommand,
      runCommandPlan,
      state: getState(),
    });
  },
});
