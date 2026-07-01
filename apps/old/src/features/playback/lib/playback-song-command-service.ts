import { SongType } from "@/src/constants/Types";
import {
  addTrackToQueue,
  playTrackNow,
} from "@/src/features/playback/lib/player-queue-actions-service";
import { getTrackFromSong } from "@/src/features/playback/lib/track-factory";

export const addSongToPlaybackQueue = async ({
  song,
  theme,
  addOffset,
  incrementAddOffset,
}: {
  song: SongType;
  theme: string;
  addOffset: number;
  incrementAddOffset: () => Promise<void>;
}) => {
  const track = await getTrackFromSong(song, theme);
  if (track) {
    await addTrackToQueue({
      track,
      addOffset,
      incrementAddOffset,
    });
  }
};

export const playSongNow = async ({
  song,
  theme,
}: {
  song: SongType;
  theme: string;
}) => {
  const track = await getTrackFromSong(song, theme);
  if (!track) {
    return false;
  }

  await playTrackNow(track);
  return true;
};
