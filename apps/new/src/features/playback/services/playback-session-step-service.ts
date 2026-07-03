import type { PlaybackState } from "../types/playback-state";

export const hydratePlaybackSession = (
  state: PlaybackState,
): PlaybackState => ({
  ...state,
  error: null,
  initialized: true,
});

export const failPlaybackSession = ({
  error,
  state,
}: {
  error: string;
  state: PlaybackState;
}): PlaybackState => ({
  ...state,
  error,
  isPlaying: false,
});

export const togglePlaybackLoopMode = (
  state: PlaybackState,
): PlaybackState => ({
  ...state,
  mode: {
    ...state.mode,
    loop: !state.mode.loop,
  },
});

export const togglePlaybackShuffleMode = (
  state: PlaybackState,
): PlaybackState => ({
  ...state,
  mode: {
    ...state.mode,
    shuffle: !state.mode.shuffle,
  },
});
