import TrackPlayer, { State } from "react-native-track-player";

export const playPlayback = async () => {
  await TrackPlayer.play();
};

export const pausePlayback = async () => {
  await TrackPlayer.pause();
};

export const skipToNextQueueTrack = async () => {
  await TrackPlayer.skipToNext();
};

export const seekToPlaybackPosition = async (position: number) => {
  await TrackPlayer.seekTo(position);
};

export const togglePlaybackState = async (currentState: State) => {
  if ([State.Paused, State.Ready].includes(currentState)) {
    await TrackPlayer.play();
  } else {
    await TrackPlayer.pause();
  }
};
