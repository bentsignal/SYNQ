import { getAppIcon } from "@/src/constants/Logos";
import { SongType, SourceType } from "@/src/constants/Types";
import { getFileName } from "@/src/lib/util";
import * as FileSystem from "expo-file-system";
import * as Haptics from "expo-haptics";
import TrackPlayer, {
  Capability,
  Event,
  Track,
  useTrackPlayerEvents,
} from "react-native-track-player";
import "react-native-get-random-values";
import { PageType, SortType } from "@/src/constants/Types";
import {
  getAlbumCoverFromSong,
  getSongsFromAlbum,
} from "@/src/controllers/AlbumController";
import { getSongsFromArtist } from "@/src/controllers/ArtistController";
import {
  getAlbumCoverPathFromSong,
  getSongCover,
} from "@/src/controllers/ImageController";
import { getPlaylistSongs } from "@/src/controllers/PlaylistController";
import { getSongById } from "@/src/controllers/SongController";
import { check } from "@/src/lib/util";
import AsyncStorage from "@react-native-async-storage/async-storage";
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

export const getTrackArtwork = (track?: Track) => {
  if (typeof track?.artwork === "string") {
    return track?.artwork;
  } else {
    return "transparent";
  }
};

export const getNextValidSong = async (
  songs: number[],
): Promise<SongType | null> => {
  let foundSong = false;
  let newSong = null;
  let attempts = 0;
  const MAX_ATTEMPTS = 50;
  while (!foundSong && attempts < MAX_ATTEMPTS) {
    if (songs.length === 0) {
      throw new Error("No valid songs found in next up");
    }
    const newId = songs.shift();
    if (newId && newId !== -1) {
      newSong = await getSongById(newId);
      if (![null, undefined, -1, "-1"].includes(newSong.id)) {
        foundSong = true;
      }
    }
    attempts++;
  }
  return newSong;
};
