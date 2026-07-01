import { SongType } from "@/src/constants/Types";
import {
  addTrackToQueue,
  playTrackNow,
} from "@/src/features/playback/lib/player-queue-actions-service";
import { getTrackFromSong } from "@/src/features/playback/lib/track-factory";
import { posthog } from "@/src/lib/posthog";

type SongQueueCommandArgs = {
  addOffset: number;
  incrementAddOffset: () => Promise<void>;
  persistSongPlaybackSource: () => Promise<void>;
  song: SongType;
  theme: string;
};

type PlaySongCommandArgs = {
  activeTrackId?: number | string;
  persistSongPlaybackSource: () => Promise<void>;
  song: SongType;
  theme: string;
};

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

  try {
    await playTrackNow(track);

    return true;
  } catch {
    return false;
  }
};

export const addSongToPlaybackQueueAfterAdStarts = async ({
  addOffset,
  incrementAddOffset,
  persistSongPlaybackSource,
  song,
  theme,
}: SongQueueCommandArgs) => {
  posthog.capture("play_ad");
  await persistSongPlaybackSource();
  await addSongToPlaybackQueue({
    song,
    theme,
    addOffset,
    incrementAddOffset,
  });
};

export const playSongFromLibrary = async ({
  activeTrackId,
  persistSongPlaybackSource,
  song,
  theme,
}: PlaySongCommandArgs) => {
  const currentId = activeTrackId ? activeTrackId : -1;
  if (currentId === song.id) {
    return false;
  }

  posthog.capture("play_song");

  const didPlaySong = await playSongNow({ song, theme });
  if (!didPlaySong) {
    return false;
  }

  await persistSongPlaybackSource();

  return true;
};
