import * as FileSystem from "expo-file-system";
import { writeId3TagsToAudioFile } from "@synq/audio";
import { getImagePathFromHash } from "@/src/features/images/services/image-storage-service";
import {
  isLibrarySongExportSnapshotStale,
  markLibrarySongExportSnapshot,
} from "@/src/features/library/services/library-song-export-snapshot-service";
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
  isLibrarySongSnapshotStale: isLibrarySongExportSnapshotStale,
  loadAlbumRows: loadLibraryExportAlbumMetadataRows,
  loadArtistRows: loadLibraryExportArtistMetadataRows,
  loadSongRow: loadLibraryExportSongMetadataRow,
  markLibrarySongAsExported: markLibrarySongExportSnapshot,
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
