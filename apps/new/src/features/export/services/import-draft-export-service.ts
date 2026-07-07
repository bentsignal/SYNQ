import * as FileSystem from "expo-file-system/legacy";
import type { ImportSongDraft } from "@/src/features/import/types/import-session";
import { assertSharingAvailable } from "./export-file-service";
import {
  shareImportDraftSongsWithDependencies,
} from "./import-draft-export-executor-service";
import {
  shareExportFilesWithDependencies,
  type ShareExportFilesDependencies,
} from "./share-export-files-executor-service";

const importDraftExportDependencies: ShareExportFilesDependencies = {
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

export async function shareImportDraftSongs(songs: ImportSongDraft[]) {
  return shareImportDraftSongsWithDependencies(songs, {
    assertSharingAvailable,
    shareExportFiles: (params) =>
      shareExportFilesWithDependencies({
        dependencies: importDraftExportDependencies,
        ...params,
      }),
  });
}
