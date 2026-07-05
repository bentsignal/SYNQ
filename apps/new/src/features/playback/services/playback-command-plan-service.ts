import {
  getClearQueuePlaybackStepPlan,
  getPausePlaybackStepPlan,
  getPlaySongPlaybackStepPlan,
  getRemoteFailurePlaybackStepPlan,
  getRemoveFromQueuePlaybackStepPlan,
  getResetPlaybackStepPlan,
  getResumePlaybackStepPlan,
  getSeekToPlaybackStepPlan,
  getSkipNextPlaybackStepPlan,
  getSkipPreviousPlaybackStepPlan,
  type PlaybackCommandPlan,
} from "./playback-command-step-service";
import {
  getRemoveFromQueueNativeCommandPlan,
  getResumeNativeCommandPlan,
  getSkipNextNativeCommandPlan,
  getSkipPreviousNativeCommandPlan,
} from "./playback-native-command-plan-service";
import type {
  PlaybackQueueItem,
  PlaybackState,
} from "../types/playback-state";

export type { PlaybackCommandPlan } from "./playback-command-step-service";
export { runPlaybackCommandPlan } from "./playback-command-plan-runner-service";

export const getPlaySongPlaybackCommandPlan = (
  song: PlaybackQueueItem,
): PlaybackCommandPlan => getPlaySongPlaybackStepPlan(song);

export const getPausePlaybackCommandPlan = (): PlaybackCommandPlan =>
  getPausePlaybackStepPlan();

export const getResumePlaybackCommandPlan = (
  state: PlaybackState,
): PlaybackCommandPlan =>
  getResumePlaybackStepPlan({
    nativeCommand: getResumeNativeCommandPlan(state),
  });

export const getSeekToPlaybackCommandPlan = (
  position: number,
): PlaybackCommandPlan => getSeekToPlaybackStepPlan(position);

export const getSkipNextPlaybackCommandPlan = (
  state: PlaybackState,
): PlaybackCommandPlan => {
  const { command, targetIndex } = getSkipNextNativeCommandPlan(state);

  return getSkipNextPlaybackStepPlan({
    nativeCommand: command,
    targetIndex,
  });
};

export const getSkipPreviousPlaybackCommandPlan = (
  state: PlaybackState,
): PlaybackCommandPlan =>
  getSkipPreviousPlaybackStepPlan({
    nativeCommand: getSkipPreviousNativeCommandPlan(state),
  });

export const getClearQueuePlaybackCommandPlan = (): PlaybackCommandPlan =>
  getClearQueuePlaybackStepPlan();

export const getResetPlaybackCommandPlan = (): PlaybackCommandPlan =>
  getResetPlaybackStepPlan();

export const getRemoveFromQueuePlaybackCommandPlan = ({
  songId,
  state,
}: {
  songId: number;
  state: PlaybackState;
}): PlaybackCommandPlan =>
  getRemoveFromQueuePlaybackStepPlan({
    nativeCommand: getRemoveFromQueueNativeCommandPlan({ songId, state }),
    songId,
  });

export const getRemoteFailurePlaybackCommandPlan = (
  message: string,
): PlaybackCommandPlan => getRemoteFailurePlaybackStepPlan(message);
