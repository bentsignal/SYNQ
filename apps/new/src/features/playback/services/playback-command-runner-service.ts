import { runAdGatedPlaybackCommand } from "./playback-command-gate-service";
import {
  runPlaybackCommandPlan,
  type PlaybackCommandPlan,
} from "./playback-command-plan-service";
import type { PlaybackNativeCommandPlan } from "./playback-native-command-plan-service";
import type { PlaybackAction } from "./playback-session-action-service";

type CreatePlaybackCommandRunnersParams = {
  beginAdBreak: () => void;
  canRunPlaybackCommand: () => boolean;
  dispatch: (action: PlaybackAction) => void;
  runNativeCommandPlan: (plan: PlaybackNativeCommandPlan) => void;
};

export type PlaybackCommandRunners = {
  runAdGatedCommand: (command: () => void) => void;
  runCommandPlan: (plan: PlaybackCommandPlan) => void;
};

export const createPlaybackCommandRunners = ({
  beginAdBreak,
  canRunPlaybackCommand,
  dispatch,
  runNativeCommandPlan,
}: CreatePlaybackCommandRunnersParams): PlaybackCommandRunners => ({
  runAdGatedCommand: (command) => {
    runAdGatedPlaybackCommand({
      beginAdBreak,
      canRunPlaybackCommand,
      command,
    });
  },
  runCommandPlan: (plan) => {
    runPlaybackCommandPlan({ dispatch, plan, runNativeCommandPlan });
  },
});
