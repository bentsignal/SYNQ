import type {
  PlaybackQueueItem,
  PlaybackState,
} from "../types/playback-state";

export const getPlaybackPlayerActionState = ({
  activeTrack,
  state,
}: {
  activeTrack: PlaybackQueueItem | null;
  state: PlaybackState;
}) => {
  const hasActiveTrack = activeTrack !== null;
  const adBreakActive = state.adGate.active || state.adGate.due;
  const canRunTrackCommand = hasActiveTrack && !adBreakActive;

  return {
    adBreakActive,
    canEditActiveTrack: canRunTrackCommand,
    canFastForward:
      canRunTrackCommand && state.duration > 0 && state.position < state.duration,
    canOpenActiveTrackDetails: canRunTrackCommand,
    canPlayPause: canRunTrackCommand,
    canRewind: canRunTrackCommand && state.position > 0,
    canSkipNext: canRunTrackCommand,
    canSkipPrevious: canRunTrackCommand,
    loopActive: state.mode.loop,
    loopLabel: state.mode.loop ? "Loop On" : "Loop Off",
    playPauseLabel: state.isPlaying ? "Pause" : "Play",
    shuffleActive: state.mode.shuffle,
    shuffleLabel: state.mode.shuffle ? "Shuffle On" : "Shuffle Off",
  };
};

export type PlaybackPlayerActionState = ReturnType<
  typeof getPlaybackPlayerActionState
>;
