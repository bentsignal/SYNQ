import type {
  PlaybackQueueItem,
  PlaybackState,
} from "../types/playback-state";
import {
  getLibrarySongDetailHref,
  getLibrarySongEditHref,
} from "../../library/services/library-song-navigation-service";
import { getPlaybackPlayerActionState } from "./playback-player-action-state-service";
import {
  getPlaybackAdBreakPanelState,
  getPlaybackPlayerScreenState,
} from "./playback-screen-state-service";

export const playerSeekStepMs = 15_000;

export const getPlaybackProgressPercent = ({
  duration,
  position,
}: {
  duration: number;
  position: number;
}) => {
  if (duration <= 0) {
    return 0;
  }

  return Math.round(Math.min(1, Math.max(0, position / duration)) * 100);
};

export const getFreeListeningRemainingMs = ({
  accumulatedMs,
  thresholdMs,
}: {
  accumulatedMs: number;
  thresholdMs: number;
}) => Math.max(0, thresholdMs - accumulatedMs);

export const getSeekTargetPosition = ({
  direction,
  duration,
  position,
  stepMs = playerSeekStepMs,
}: {
  direction: "backward" | "forward";
  duration: number;
  position: number;
  stepMs?: number;
}) => {
  const offset = direction === "backward" ? -stepMs : stepMs;

  return Math.max(0, Math.min(duration, position + offset));
};

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
    activeTrackDetailLink:
      activeTrackId !== null && actionState.canOpenActiveTrackDetails
        ? {
            href: getLibrarySongDetailHref({ songId: activeTrackId }),
            label: "Song details",
          }
        : null,
    activeTrackEditLink:
      activeTrackId !== null && actionState.canEditActiveTrack
        ? {
            href: getLibrarySongEditHref({ songId: activeTrackId }),
            label: "Edit song",
          }
        : null,
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
