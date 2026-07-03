import * as FileSystem from "expo-file-system";
import { writeId3TagsToAudioFile } from "@synq/audio";
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
import {
  prepareLibrarySongForExportWithDependencies,
  type LibraryExportMetadataDependencies,
} from "./library-export-metadata-executor-service";

const libraryExportMetadataDependencies: LibraryExportMetadataDependencies = {
  getImagePathFromHash,
  getInfo: FileSystem.getInfoAsync,
  isLibrarySongSnapshotStale,
  loadAlbumRows: loadLibraryExportAlbumMetadataRows,
  loadArtistRows: loadLibraryExportArtistMetadataRows,
  loadSongRow: loadLibraryExportSongMetadataRow,
  markLibrarySongAsExported,
  readAsString: (path, options) =>
    FileSystem.readAsStringAsync(path, options),
  writeTags: writeId3TagsToAudioFile,
};

export const prepareLibrarySongForExport = async (
  song: ExportableLibrarySong & { pathToFile: string },
) => {
  return prepareLibrarySongForExportWithDependencies(
    song,
    libraryExportMetadataDependencies,
  );
};
