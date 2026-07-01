import { PageType, SongType } from "@/src/constants/Types";
import { getLibrarySongById } from "@/src/features/library/repository/library-song-repository";
import {
  getActiveQueueTrackIndex,
  getPlaybackQueue,
} from "@/src/features/playback/lib/playback-queue-read-service";
import { type Track } from "react-native-track-player";

const getPlaybackQueueDisplaySong = async (
  track: Track,
): Promise<SongType | undefined> => {
  if (track.id === -1) {
    return undefined;
  }

  const result = await getLibrarySongById(track.id, PageType.QUEUE);
  if (!result) {
    return undefined;
  }

  result.uuid = track.description;

  return result;
};

export const getPlaybackQueueDisplaySongs = async () => {
  const queue = await getPlaybackQueue();
  const songs = await Promise.all(
    queue.map(async (track) => {
      try {
        return await getPlaybackQueueDisplaySong(track);
      } catch {
        return undefined;
      }
    }),
  );

  return songs.filter((song): song is SongType => song !== undefined);
};

export const getPlaybackQueueDisplayState = async () => {
  const [activeIndex, songs] = await Promise.all([
    getActiveQueueTrackIndex(),
    getPlaybackQueueDisplaySongs(),
  ]);

  return {
    activeIndex,
    songs,
  };
};

export const getPlaybackQueueDisplayActiveIndex = () => {
  return getActiveQueueTrackIndex();
};
