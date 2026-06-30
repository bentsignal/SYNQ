import {
  AlbumType,
  ArtistType,
  InfoType,
  SongType,
} from "@/src/constants/Types";
import { checkForTrackNumber, idgen } from "@/src/lib/util";
import { getAudioMetadata } from "@missingcore/audio-metadata";
import * as DocumentPicker from "expo-document-picker";
import * as FileSystem from "expo-file-system";
import "react-native-get-random-values";
import { getAlbumFromMetadata } from "@/src/controllers/AlbumController";
import { getArtistsFromMetadata } from "@/src/controllers/ArtistController";
import { exportSongs as exportSongsFromFeature } from "@/src/features/export/lib/export-songs";
import { loadAudio } from "./AudioController";

export const importFiles = async (
  countdown: (value: number) => void,
  updateSize: (value: number) => void,
) => {
  const results = await DocumentPicker.getDocumentAsync({
    type: ["audio/mpeg", "audio/wav", "audio/mp4", "audio/flac", "audio/aac"],
    multiple: true,
    copyToCacheDirectory: true,
  });
  const songs: SongType[] = [];
  let song: SongType;
  if (results.canceled === false) {
    await createImportDir();
    updateSize(results.assets.length);
    for (let i = 0; i < results.assets.length; i++) {
      countdown(results.assets.length - i);
      // Rename file
      const newUri = `${FileSystem.cacheDirectory}import/${results.assets[i].name}`;
      await FileSystem.moveAsync({
        from: results.assets[i].uri,
        to: newUri,
      });
      results.assets[i].uri = newUri;
      try {
        song = await processSong(
          newUri,
          results.assets[i].name,
          idgen(10),
          results.assets[i].mimeType ?? results.assets[i].name,
        );
        songs.push(song);
      } catch (error) {
        console.log("error processing song:", results.assets[i].name, error);
      }
    }

    return songs;
  } else {
    return songs;
  }
};

export const getWifiTransferSong = async (
  name: string,
  id: number,
  type: string,
  data: string,
): Promise<SongType> => {
  const destination = `${FileSystem.cacheDirectory}import/${id}${name}`;
  await FileSystem.writeAsStringAsync(destination, data, {
    encoding: "base64",
  });
  const song = await processSong(destination, name, id, type);
  return song;
};

const processSong = async (
  url: string,
  name: string,
  id: number,
  type: string,
) => {
  // read metadata from file
  const wantedTags = [
    "artwork",
    "artist",
    "name",
    "album",
    "year",
    "track",
  ] as const;
  let info: InfoType = {};
  try {
    info = await getAudioMetadata(url, wantedTags);
  } catch (error) {
    console.log("error reading metadata:", name, error);
  }

  // add artists
  let importArtists: ArtistType[] = [];
  if (info.metadata?.artist) {
    importArtists = await getArtistsFromMetadata(info.metadata.artist);
    if (importArtists.length > 0) {
      info.metadata.artist = importArtists
        .map((artist) => artist.name)
        .join(", ");
    } else {
      info.metadata.artist = "";
    }
  }

  // add albums
  let importAlbums: AlbumType[] = [];
  if (info.metadata?.album) {
    const importAlbum = await getAlbumFromMetadata(
      info.metadata.album,
      info.metadata?.year,
      info.metadata?.artwork,
    );
    if (importAlbum?.name) {
      info.metadata.album = importAlbum.name;
      importAlbum.image = info.metadata?.artwork;
      importAlbums.push(importAlbum);
    } else {
      info.metadata.album = "";
    }
  }

  // get duration of song
  const duration = await loadAudio(url);

  // check for track number
  let title = info.metadata?.name ?? "";
  let track: number | undefined;
  const checkFileName = checkForTrackNumber(name);
  if (checkFileName) {
    track = checkFileName;
  }
  const checkTitle = checkForTrackNumber(title);
  if (checkTitle) {
    track = checkTitle;
    title = title.substring(3);
  }
  if (info.metadata?.track) {
    track = info.metadata.track;
  }

  return {
    fileName: name,
    fileType: type,
    id: id,
    title: title,
    artist: info.metadata?.artist ?? "",
    album: info.metadata?.album ?? "",
    artwork: importAlbums.length === 0 ? info.metadata?.artwork : "",
    importArtists: importArtists,
    importAlbums: importAlbums,
    cacheUri: url,
    track,
    duration: duration,
  };
};

export const exportSongs = exportSongsFromFeature;

export const deleteImportSongs = async (songs: SongType[]) => {
  for (let i = 0; i < songs.length; i++) {
    const song = songs[i];
    if (song.cacheUri) {
      await FileSystem.deleteAsync(song.cacheUri);
    }
  }
};

export const createImportDir = async () => {
  try {
    const importDir = `${FileSystem.cacheDirectory}import`;
    const info = await FileSystem.getInfoAsync(importDir);
    if (info.exists) {
      await FileSystem.deleteAsync(importDir);
    }
    await FileSystem.makeDirectoryAsync(importDir);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    if (!message.includes("already exists")) {
      console.log("error creating import directory: ", error);
    }
  }
};
