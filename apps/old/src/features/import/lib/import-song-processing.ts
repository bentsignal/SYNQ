import { AlbumType, ArtistType, InfoType, SongType } from "@/src/constants/Types";
import {
  getLibraryAlbumFromMetadata,
  getLibraryArtistsFromMetadata,
} from "@/src/features/library/repository/library-entity-repository";
import { checkForTrackNumber } from "@/src/lib/util";
import { getAudioDurationFromFile, getMetadataFromFile } from "@synq/audio";
import * as FileSystem from "expo-file-system";

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

export const getWifiTransferSong = async (
  name: string,
  id: number,
  type: string,
  data: string,
) => {
  const destination = `${FileSystem.cacheDirectory}import/${id}${name}`;
  await FileSystem.writeAsStringAsync(destination, data, {
    encoding: "base64",
  });
  return processImportSongFromFile(destination, name, id, type);
};

export const processImportSongFromFile = async (
  url: string,
  name: string,
  id: number,
  type: string,
): Promise<SongType> => {
  const info: InfoType = {};

  try {
    info.metadata = await getMetadataFromFile(url);
  } catch (error) {
    console.log("error reading metadata:", name, error);
  }

  let importArtists: ArtistType[] = [];
  if (info.metadata?.artist) {
    importArtists = await getLibraryArtistsFromMetadata(info.metadata.artist);
    info.metadata.artist = importArtists.map((artist) => artist.name).join(", ");
  }

  const importAlbums: AlbumType[] = [];
  if (info.metadata?.album) {
    const importAlbum = await getLibraryAlbumFromMetadata(
      info.metadata.album,
      info.metadata.year,
      info.metadata.artwork,
    );

    if (importAlbum?.name) {
      info.metadata.album = importAlbum.name;
      importAlbum.image = info.metadata.artwork;
      importAlbums.push(importAlbum);
    } else {
      info.metadata.album = "";
    }
  }

  let duration = 0;
  try {
    duration = await getAudioDurationFromFile(url);
  } catch (error) {
    console.error("Error loading audio:", error);
  }

  let title = info.metadata?.name ?? "";
  let track: number | undefined;
  const fileNameTrack = checkForTrackNumber(name);
  if (fileNameTrack) {
    track = fileNameTrack;
  }

  const titleTrack = checkForTrackNumber(title);
  if (titleTrack) {
    track = titleTrack;
    title = title.substring(3);
  }

  if (info.metadata?.track) {
    track = info.metadata.track;
  }

  return {
    fileName: name,
    fileType: type,
    id,
    title,
    artist: info.metadata?.artist ?? "",
    album: info.metadata?.album ?? "",
    artwork: importAlbums.length === 0 ? info.metadata?.artwork : "",
    importArtists,
    importAlbums,
    cacheUri: url,
    track,
    duration,
  };
};
