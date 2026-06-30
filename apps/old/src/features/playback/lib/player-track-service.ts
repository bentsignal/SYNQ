import { getAppIcon } from "@/src/constants/Logos";
import TrackPlayer, { Track } from "react-native-track-player";

export { getTrackArtwork, getTrackFromSong } from "./track-factory";

export const playAd = async (theme: string, adURL: string) => {
  const adTrack = {
    id: -2,
    url: adURL,
    title: "Premium Ad",
    artist: "SYNQ",
    artwork: getAppIcon(theme),
  };
  await playTrack(adTrack);
};

export const playTrack = async (track: Track): Promise<void> => {
  const currentIndex = await TrackPlayer.getActiveTrackIndex();
  const queue = await TrackPlayer.getQueue();
  // current song is last in queue, add to end and skip to it
  if (currentIndex === queue.length - 1) {
    await TrackPlayer.add(track);
    await TrackPlayer.skipToNext();
  }
  // no song is playing
  else if (currentIndex === undefined) {
    await TrackPlayer.add(track);
  }
  // somewhere in the middle of the queue
  else {
    await TrackPlayer.add(track, currentIndex + 1);
    await TrackPlayer.skipToNext();
  }
  await TrackPlayer.play();
};
