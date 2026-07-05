import type {
  PlaybackQueueItem,
  PlaybackState,
} from "../types/playback-state";
import { getPlaybackQueueActionState } from "./playback-queue-action-state-service";
import { getPlaybackQueueRowPresentation } from "./playback-queue-row-service";
import {
  getPlaybackPlayerHref,
  getPlaybackPremiumHref,
} from "./playback-screen-state-service";

export const getPlaybackQueueEmptyState = () => ({
  body: "Open a song from Library to start listening.",
  title: "Queue is empty",
});

export const getPlaybackQueueScreenState = () => ({
  adBreakPanel: {
    action: {
      href: getPlaybackPremiumHref(),
      label: "Open Premium",
    },
    body:
      "Queue playback commands are paused while the bundled ad plays. Your song resumes automatically when the ad finishes.",
    kicker: "Premium gate",
    title: "Ad break required",
  },
  backLink: {
    href: getPlaybackPlayerHref(),
    label: "Back to player",
  },
  clearQueueLabel: "Clear queue",
  emptyState: getPlaybackQueueEmptyState(),
  header: {
    kicker: "Playback queue",
    subtitle:
      "Reorder upcoming songs, remove tracks, or jump to a different song.",
    title: "Now Playing",
  },
});

export const getPlaybackQueueViewState = ({
  activeTrackId,
  adBreakActive,
  queue,
}: {
  activeTrackId: number | null;
  adBreakActive: boolean;
  queue: PlaybackQueueItem[];
}) => ({
  actionState: getPlaybackQueueActionState({ queueLength: queue.length }),
  rows: queue.map((song, index) => ({
    rowState: getPlaybackQueueRowPresentation({
      activeTrackId,
      adBreakActive,
      index,
      queueLength: queue.length,
      song,
    }),
    song,
  })),
  screenState: getPlaybackQueueScreenState(),
});

export const getPlaybackQueueControllerViewState = ({
  activeTrack,
  state,
}: {
  activeTrack: PlaybackQueueItem | null;
  state: PlaybackState;
}) => {
  const adBreakActive = state.adGate.active || state.adGate.due;

  return {
    adBreakActive,
    ...getPlaybackQueueViewState({
      activeTrackId: activeTrack?.id ?? null,
      adBreakActive,
      queue: state.queue,
    }),
  };
};

export type PlaybackQueueControllerViewState = ReturnType<
  typeof getPlaybackQueueControllerViewState
>;
