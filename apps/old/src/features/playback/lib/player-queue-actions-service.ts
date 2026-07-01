import { persistPlaybackQueue } from "@/src/features/playback/lib/playback-queue-persistence-service";
import TrackPlayer, { Track } from "react-native-track-player";

export const addTrackToQueue = async ({
  track,
  addOffset,
  incrementAddOffset,
}: {
  track: Track;
  addOffset: number;
  incrementAddOffset: () => Promise<void>;
}) => {
  const currentIndex = await TrackPlayer.getActiveTrackIndex();
  if (currentIndex !== undefined) {
    await TrackPlayer.add(track, currentIndex + addOffset + 1);
    await incrementAddOffset();
  }
  await persistPlaybackQueue();
};

export const moveQueueTrack = async (from: number, to: number) => {
  await TrackPlayer.move(from, to);
  await persistPlaybackQueue();
};

export const playTrackNow = async (track: Track): Promise<void> => {
  const currentIndex = await TrackPlayer.getActiveTrackIndex();
  const queue = await TrackPlayer.getQueue();
  if (currentIndex === queue.length - 1) {
    await TrackPlayer.add(track);
    await TrackPlayer.skipToNext();
  } else if (currentIndex === undefined) {
    await TrackPlayer.add(track);
  } else {
    await TrackPlayer.add(track, currentIndex + 1);
    await TrackPlayer.skipToNext();
  }
  await TrackPlayer.play();
  await persistPlaybackQueue();
};

export const removeTracksBySongIds = async (songIds: number[]) => {
  const idsToRemove = new Set(songIds);
  const queue = await TrackPlayer.getQueue();
  const indicesToRemove = queue
    .map((track: Track, index: number) =>
      idsToRemove.has(Number(track.id)) ? index : -1,
    )
    .filter((index) => index !== -1);

  await TrackPlayer.remove(indicesToRemove);
  await persistPlaybackQueue();
};

export const resetPlaybackQueue = async () => {
  await TrackPlayer.reset();
  await persistPlaybackQueue();
};
