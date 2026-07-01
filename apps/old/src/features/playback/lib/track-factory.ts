import { getAppIcon } from "@/src/constants/Logos";
import { SongType } from "@/src/constants/Types";
import { getLibrarySongCoverPath } from "@/src/features/library/repository/library-song-repository";
import { getFileName } from "@/src/lib/util";
import * as FileSystem from "expo-file-system";
import "react-native-get-random-values";
import { type Track } from "react-native-track-player";
import { v4 as uuidv4 } from "uuid";

const getTrackArtworkFromSong = async (songId: number, theme: string) => {
  try {
    return (await getLibrarySongCoverPath(songId, true)) ?? getAppIcon(theme);
  } catch {
    return getAppIcon(theme);
  }
};

export const getTrackFromSong = async (
  song: SongType,
  theme: string,
): Promise<Track | undefined> => {
  if (!song.fileName) {
    return undefined;
  }

  const libraryPath = `${FileSystem.documentDirectory}library/${song.id}`;
  const audioPath = `${libraryPath}/${song.fileName}`;

  return {
    id: song.id,
    url: audioPath,
    description: uuidv4(),
    title: song.title ?? getFileName(audioPath),
    artist: song.artist,
    album: song.album,
    artwork: await getTrackArtworkFromSong(song.id, theme),
  };
};

export const getTrackArtwork = (track?: Track) => {
  if (typeof track?.artwork === "string") {
    return track?.artwork;
  } else {
    return "transparent";
  }
};
