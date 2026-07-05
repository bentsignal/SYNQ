import type { PlaybackAction } from "./playback-session-action-service";
import type { PlaybackCommandPlan } from "./playback-command-step-service";
import type { PlaybackNativeCommandPlan } from "./playback-native-command-plan-service";

export const runPlaybackCommandPlan = ({
  dispatch,
  plan,
  runNativeCommandPlan,
}: {
  dispatch: (action: PlaybackAction) => void;
  plan: PlaybackCommandPlan;
  runNativeCommandPlan: (plan: PlaybackNativeCommandPlan) => void;
}) => {
  dispatch(plan.action);
  runNativeCommandPlan(plan.nativeCommand);
};
