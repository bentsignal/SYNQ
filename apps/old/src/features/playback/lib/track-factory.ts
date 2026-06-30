import { getAppIcon } from "@/src/constants/Logos";
import { SongType } from "@/src/constants/Types";
import { getAlbumCoverFromSong } from "@/src/controllers/AlbumController";
import { getSongCover } from "@/src/controllers/ImageController";
import { getFileName, check } from "@/src/lib/util";
import * as FileSystem from "expo-file-system";
import "react-native-get-random-values";
import { Track } from "react-native-track-player";
import { v4 as uuidv4 } from "uuid";

export const getTrackFromSong = async (
  song: SongType,
  theme: string,
): Promise<Track | undefined> => {
  try {
    if (!song.fileName) {
      return undefined;
    }

    const libraryPath = `${FileSystem.documentDirectory}library/${song.id}`;
    let coverPath: string | null | undefined = await getAlbumCoverFromSong(
      song.id,
      true,
    );
    if (!check(coverPath)) {
      coverPath = await getSongCover(song.id, true);
    }
    const audioPath = `${libraryPath}/${song.fileName}`;
    return {
      id: song.id,
      url: audioPath,
      description: uuidv4(),
      title: song.title ?? getFileName(audioPath),
      artist: song.artist,
      album: song.album,
      artwork: coverPath ? coverPath : getAppIcon(theme),
    };
  } catch (error) {
    console.error("Error in audio playback:", error);
  }
};

export const getTrackArtwork = (track?: Track) => {
  if (typeof track?.artwork === "string") {
    return track?.artwork;
  } else {
    return "transparent";
  }
};
