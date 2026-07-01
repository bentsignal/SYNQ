import TrackPlayer from "react-native-track-player";

export const getActiveQueueTrackIndex = async () => {
  return TrackPlayer.getActiveTrackIndex();
};

export const getPlaybackQueue = async () => {
  return TrackPlayer.getQueue();
};
