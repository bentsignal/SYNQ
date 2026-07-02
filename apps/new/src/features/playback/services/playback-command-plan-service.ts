import type { PlaybackAction } from "./playback-session-service";
import type { PlaybackNativeCommandPlan } from "./playback-native-command-plan-service";
import type { PlaybackQueueItem } from "../types/playback-state";

export type PlaybackCommandPlan = {
  action: PlaybackAction;
  nativeCommand: PlaybackNativeCommandPlan;
};

export const getPlaySongPlaybackCommandPlan = (
  song: PlaybackQueueItem,
): PlaybackCommandPlan => ({
  action: { song, type: "play-song" },
  nativeCommand: { track: song, type: "play" },
});

export const getClearQueuePlaybackCommandPlan = (): PlaybackCommandPlan => ({
  action: { type: "clear-queue" },
  nativeCommand: { type: "stop" },
});

export const getResetPlaybackCommandPlan = (): PlaybackCommandPlan => ({
  action: { type: "reset" },
  nativeCommand: { type: "stop" },
});

export const getRemoteFailurePlaybackCommandPlan = (
  message: string,
): PlaybackCommandPlan => ({
  action: { error: message, type: "remote-failure" },
  nativeCommand: { type: "stop" },
});
