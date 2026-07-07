import type { PlaybackState } from "../types/playback-state";

export const setPlaybackActiveQueueIndex = ({
  index,
  state,
}: {
  index: number | null;
  state: PlaybackState;
}): PlaybackState => {
  const track = index === null ? null : state.queue[index] ?? null;

  if (!track) {
    return {
      ...state,
      activeQueueIndex: null,
      activeTrackId: null,
      isPlaying: false,
      position: state.duration,
    };
  }

  return {
    ...state,
    activeQueueIndex: index,
    activeTrackId: track.id,
    duration: track.duration ?? 0,
    isPlaying: true,
    position: 0,
  };
};
