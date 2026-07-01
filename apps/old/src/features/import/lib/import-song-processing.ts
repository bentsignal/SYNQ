import { AlbumType, ArtistType, InfoType, SongType } from "@/src/constants/Types";
import {
  getLibraryAlbumFromMetadata,
  getLibraryArtistsFromMetadata,
} from "@/src/features/library/repository/library-entity-repository";
import { checkForTrackNumber, idgen } from "@/src/lib/util";
import {
  getAudioDurationFromFile,
  getMetadataFromFile,
  supportedAudioFileTypes,
} from "@synq/audio";
import * as DocumentPicker from "expo-document-picker";
import * as FileSystem from "expo-file-system";

export const createImportDir = async (): Promise<boolean> => {
  try {
    const importDir = `${FileSystem.cacheDirectory}import`;
    await FileSystem.deleteAsync(importDir, { idempotent: true });
    await FileSystem.makeDirectoryAsync(importDir, { intermediates: true });
    return true;
  } catch {
    return false;
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

export const importFiles = async (
  countdown: (value: number) => void,
  updateSize: (value: number) => void,
) => {
  const results = await DocumentPicker.getDocumentAsync({
    type: supportedAudioFileTypes,
    multiple: true,
    copyToCacheDirectory: true,
  });

  const songs: SongType[] = [];
  if (results.canceled) {
    return songs;
  }

  const importDirReady = await createImportDir();
  if (!importDirReady) {
    return songs;
  }

  updateSize(results.assets.length);

  for (let index = 0; index < results.assets.length; index += 1) {
    const asset = results.assets[index];
    countdown(results.assets.length - index);
    const newUri = `${FileSystem.cacheDirectory}import/${asset.name}`;
    await FileSystem.moveAsync({
      from: asset.uri,
      to: newUri,
    });
    asset.uri = newUri;

    try {
      songs.push(
        await processImportSongFromFile(
          newUri,
          asset.name,
          idgen(10),
          asset.mimeType ?? asset.name,
        ),
      );
    } catch {
      // Keep importing the remaining files when a single asset cannot be parsed.
    }
  }

  return songs;
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
  } catch {
    // Metadata is optional; import the playable file with filename fallbacks.
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
  } catch {
    // Duration is optional; keep the imported song with the default duration.
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
