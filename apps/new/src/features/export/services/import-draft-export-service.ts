import * as FileSystem from "expo-file-system";
import type { ImportSongDraft } from "@/src/features/import/types/import-session";
import { assertSharingAvailable } from "./export-file-service";
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
  await assertSharingAvailable();

  return shareExportFilesWithDependencies({
    dependencies: importDraftExportDependencies,
    directoryPrefix: "synq-import-export",
    files: songs.map((song) => ({
      fileNameFallback: song.fileName || song.title,
      sourceUri: song.cacheUri,
    })),
    noFilesMessage: "No staged songs are available to export.",
  });
}
