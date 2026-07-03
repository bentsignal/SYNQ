import * as FileSystem from "expo-file-system";
import { writeId3TagsToAudioFile, type AudioMetadataTags } from "@synq/audio";
import { getImagePathFromHash } from "@/src/features/images/services/image-storage-service";
import {
  isLibrarySongSnapshotStale,
  markLibrarySongAsExported,
} from "@/src/features/library/repository/library-song-export-snapshot-repository";
import {
  loadLibraryExportAlbumMetadataRows,
  loadLibraryExportArtistMetadataRows,
  loadLibraryExportSongMetadataRow,
} from "../repository/library-export-metadata-repository";
import type { ExportableLibrarySong } from "./library-export-service";

const formatNames = (names: string[]) =>
  names
    .filter(Boolean)
    .sort((first, second) => first.localeCompare(second))
    .join(", ");

const loadArtworkTag = async (coverImage: string | null) => {
  if (!coverImage) {
    return null;
  }

  const { pathToFullImage } = getImagePathFromHash(coverImage);
  const fileInfo = await FileSystem.getInfoAsync(pathToFullImage);

  if (!fileInfo.exists) {
    return null;
  }

  return {
    description: "Album Cover",
    imageBuffer: await FileSystem.readAsStringAsync(pathToFullImage, {
      encoding: "base64",
    }),
    mime: "image/jpeg",
  };
};

const loadLibrarySongExportMetadata = async (songId: number) => {
  const song = await loadLibraryExportSongMetadataRow(songId);

  if (!song) {
    return null;
  }

  const [artists, albums] = await Promise.all([
    loadLibraryExportArtistMetadataRows(songId),
    loadLibraryExportAlbumMetadataRows(songId),
  ]);

  return {
    album: formatNames(albums.flatMap((album) => album.name ?? [])),
    artist: formatNames(artists.flatMap((artist) => artist.name ?? [])),
    coverImage:
      song.coverImage ??
      albums.find((album) => album.coverImage !== null)?.coverImage ??
      null,
    fileType: song.fileType,
    pathToFile: song.pathToFile,
    title: song.title ?? "Untitled song",
  };
};

export const prepareLibrarySongForExport = async (
  song: ExportableLibrarySong & { pathToFile: string },
) => {
  const stale = await isLibrarySongSnapshotStale(song.id);

  if (stale !== true) {
    return song.pathToFile;
  }

  const metadata = await loadLibrarySongExportMetadata(song.id);
  if (!metadata?.pathToFile) {
    return song.pathToFile;
  }

  const tags: AudioMetadataTags = {
    album: metadata.album,
    artist: metadata.artist,
    title: metadata.title,
  };
  const artwork = await loadArtworkTag(metadata.coverImage);
  if (artwork) {
    tags.APIC = artwork;
  }

  try {
    await writeId3TagsToAudioFile({
      filePath: metadata.pathToFile,
      fileType: metadata.fileType,
      tags,
    });
    await markLibrarySongAsExported(song.id);
  } catch {
    // Export should still share the playable file when metadata writeback fails.
  }

  return metadata.pathToFile;
};
