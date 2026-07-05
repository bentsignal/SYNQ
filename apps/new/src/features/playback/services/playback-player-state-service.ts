import type {
  PlaybackQueueItem,
  PlaybackState,
} from "../types/playback-state";
import { getPlaybackPlayerActionState } from "./playback-player-action-state-service";
import { getPlaybackPlayerActiveTrackLinks } from "./playback-player-link-service";
import {
  getPlaybackAdBreakPanelState,
  getPlaybackPlayerScreenState,
} from "./playback-screen-state-service";
import {
  getFreeListeningRemainingMs,
  getPlaybackProgressPercent,
} from "./playback-player-progress-service";

export {
  getFreeListeningRemainingMs,
  getPlaybackProgressPercent,
  getSeekTargetPosition,
  playerSeekStepMs,
} from "./playback-player-progress-service";

export const getPlaybackPlayerViewState = ({
  activeTrack,
  state,
}: {
  activeTrack: PlaybackQueueItem | null;
  state: PlaybackState;
}) => {
  const actionState = getPlaybackPlayerActionState({ activeTrack, state });
  const activeTrackId = activeTrack?.id ?? null;

  return {
    actionState,
    ...getPlaybackPlayerActiveTrackLinks({ actionState, activeTrackId }),
    adProgressPercent: getPlaybackProgressPercent({
      duration: state.adGate.playbackDuration,
      position: state.adGate.playbackPosition,
    }),
    adBreakPanel: getPlaybackAdBreakPanelState({ state }),
    freeListeningRemainingMs: getFreeListeningRemainingMs({
      accumulatedMs: state.adGate.accumulatedMs,
      thresholdMs: state.adGate.thresholdMs,
    }),
    progressPercent: getPlaybackProgressPercent({
      duration: state.duration,
      position: state.position,
    }),
    screenState: getPlaybackPlayerScreenState(),
  };
};

export type PlaybackPlayerViewState = ReturnType<
  typeof getPlaybackPlayerViewState
>;

export type PlaybackPlayerLink = NonNullable<
  PlaybackPlayerViewState["activeTrackDetailLink"]
>;

export const getPlaybackPlayerControllerViewState = ({
  activeTrack,
  state,
}: {
  activeTrack: PlaybackQueueItem | null;
  state: PlaybackState;
}) => getPlaybackPlayerViewState({ activeTrack, state });

export type PlaybackPlayerControllerViewState = ReturnType<
  typeof getPlaybackPlayerControllerViewState
>;
