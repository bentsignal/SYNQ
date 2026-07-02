import type { PlaybackAction } from "./playback-session-service";
import type { PlaybackNativeCommandPlan } from "./playback-native-command-plan-service";

export const getRemoteFailurePlaybackCommandPlan = (
  message: string,
): {
  action: PlaybackAction;
  nativeCommand: PlaybackNativeCommandPlan;
} => ({
  action: { error: message, type: "remote-failure" },
  nativeCommand: { type: "stop" },
});
