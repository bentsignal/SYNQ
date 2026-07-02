import type { PlaybackAction } from "./playback-session-service";
import {
  getRemoveFromQueueNativeCommandPlan,
  getResumeNativeCommandPlan,
  getSkipNextNativeCommandPlan,
  getSkipPreviousNativeCommandPlan,
  type PlaybackNativeCommandPlan,
} from "./playback-native-command-plan-service";
import type {
  PlaybackQueueItem,
  PlaybackState,
} from "../types/playback-state";

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

export const getPausePlaybackCommandPlan = (): PlaybackCommandPlan => ({
  action: { type: "pause" },
  nativeCommand: { type: "pause" },
});

export const getResumePlaybackCommandPlan = (
  state: PlaybackState,
): PlaybackCommandPlan => ({
  action: { type: "resume" },
  nativeCommand: getResumeNativeCommandPlan(state),
});

export const getSeekToPlaybackCommandPlan = (
  position: number,
): PlaybackCommandPlan => ({
  action: { position, type: "seek-to" },
  nativeCommand: { position, type: "seek" },
});

export const getSkipNextPlaybackCommandPlan = (
  state: PlaybackState,
): PlaybackCommandPlan => {
  const { command, targetIndex } = getSkipNextNativeCommandPlan(state);

  return {
    action: { targetIndex, type: "skip-next" },
    nativeCommand: command,
  };
};

export const getSkipPreviousPlaybackCommandPlan = (
  state: PlaybackState,
): PlaybackCommandPlan => ({
  action: { type: "skip-previous" },
  nativeCommand: getSkipPreviousNativeCommandPlan(state),
});

export const getClearQueuePlaybackCommandPlan = (): PlaybackCommandPlan => ({
  action: { type: "clear-queue" },
  nativeCommand: { type: "stop" },
});

export const getResetPlaybackCommandPlan = (): PlaybackCommandPlan => ({
  action: { type: "reset" },
  nativeCommand: { type: "stop" },
});

export const getRemoveFromQueuePlaybackCommandPlan = ({
  songId,
  state,
}: {
  songId: number;
  state: PlaybackState;
}): PlaybackCommandPlan => ({
  action: { songId, type: "remove-from-queue" },
  nativeCommand: getRemoveFromQueueNativeCommandPlan({ songId, state }),
});

export const getRemoteFailurePlaybackCommandPlan = (
  message: string,
): PlaybackCommandPlan => ({
  action: { error: message, type: "remote-failure" },
  nativeCommand: { type: "stop" },
});
