import * as FileSystem from "expo-file-system";
import { assertSharingAvailable } from "./export-file-service";
import { prepareLibrarySongForExport } from "./library-export-metadata-service";
import {
  shareLibrarySongsWithDependencies,
  type ExportableLibrarySong,
} from "./library-export-share-executor-service";
import {
  shareExportFilesWithDependencies,
  type ShareExportFilesDependencies,
} from "./share-export-files-executor-service";

export type { ExportableLibrarySong };

const libraryExportDependencies: ShareExportFilesDependencies = {
  cacheDirectory: FileSystem.cacheDirectory,
  copyFile: FileSystem.copyAsync,
  deletePath: FileSystem.deleteAsync,
  makeDirectory: FileSystem.makeDirectoryAsync,
  now: Date.now,
  sharePath: async (path) => {
    const Sharing = await import("expo-sharing");
    await Sharing.shareAsync(path);
  },
};

export async function shareLibrarySongs(songs: ExportableLibrarySong[]) {
  return shareLibrarySongsWithDependencies(songs, {
    assertSharingAvailable,
    prepareLibrarySongForExport,
    shareExportFiles: (params) =>
      shareExportFilesWithDependencies({
        dependencies: libraryExportDependencies,
        ...params,
      }),
  });
}
