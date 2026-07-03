import type { PlaybackQueueItem } from "../types/playback-state";
import type { PlaybackAction } from "./playback-session-service";
import type { PlaybackNativeCommandPlan } from "./playback-native-command-step-service";

export type PlaybackCommandPlan = {
  action: PlaybackAction;
  nativeCommand: PlaybackNativeCommandPlan;
};

export const getPlaySongPlaybackStepPlan = (
  song: PlaybackQueueItem,
): PlaybackCommandPlan => ({
  action: { song, type: "play-song" },
  nativeCommand: { track: song, type: "play" },
});

export const getPausePlaybackStepPlan = (): PlaybackCommandPlan => ({
  action: { type: "pause" },
  nativeCommand: { type: "pause" },
});

export const getResumePlaybackStepPlan = ({
  nativeCommand,
}: {
  nativeCommand: PlaybackNativeCommandPlan;
}): PlaybackCommandPlan => ({
  action: { type: "resume" },
  nativeCommand,
});

export const getSeekToPlaybackStepPlan = (
  position: number,
): PlaybackCommandPlan => ({
  action: { position, type: "seek-to" },
  nativeCommand: { position, type: "seek" },
});

export const getSkipNextPlaybackStepPlan = ({
  nativeCommand,
  targetIndex,
}: {
  nativeCommand: PlaybackNativeCommandPlan;
  targetIndex: number | null;
}): PlaybackCommandPlan => ({
  action: { targetIndex, type: "skip-next" },
  nativeCommand,
});

export const getSkipPreviousPlaybackStepPlan = ({
  nativeCommand,
}: {
  nativeCommand: PlaybackNativeCommandPlan;
}): PlaybackCommandPlan => ({
  action: { type: "skip-previous" },
  nativeCommand,
});

export const getClearQueuePlaybackStepPlan = (): PlaybackCommandPlan => ({
  action: { type: "clear-queue" },
  nativeCommand: { type: "stop" },
});

export const getResetPlaybackStepPlan = (): PlaybackCommandPlan => ({
  action: { type: "reset" },
  nativeCommand: { type: "stop" },
});

export const getRemoveFromQueuePlaybackStepPlan = ({
  nativeCommand,
  songId,
}: {
  nativeCommand: PlaybackNativeCommandPlan;
  songId: number;
}): PlaybackCommandPlan => ({
  action: { songId, type: "remove-from-queue" },
  nativeCommand,
});

export const getRemoteFailurePlaybackStepPlan = (
  message: string,
): PlaybackCommandPlan => ({
  action: { error: message, type: "remote-failure" },
  nativeCommand: { type: "stop" },
});
