import * as FileSystem from "expo-file-system";
import { assertSharingAvailable } from "./export-file-service";
import { prepareLibrarySongForExport } from "./library-export-metadata-service";
import {
  shareExportFilesWithDependencies,
  type ShareExportFilesDependencies,
} from "./share-export-files-executor-service";

export type ExportableLibrarySong = {
  id: number;
  pathToFile: string | null;
  title: string;
};

const getPlayableSongs = (songs: ExportableLibrarySong[]) =>
  songs.filter(
    (song): song is ExportableLibrarySong & { pathToFile: string } =>
      song.pathToFile !== null,
  );

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
  await assertSharingAvailable();

  const playableSongs = getPlayableSongs(songs);
  const files = await Promise.all(
    playableSongs.map(async (song) => ({
      fileNameFallback: song.title,
      sourceUri: await prepareLibrarySongForExport(song),
    })),
  );

  return shareExportFilesWithDependencies({
    dependencies: libraryExportDependencies,
    directoryPrefix: "synq-export",
    files,
    noFilesMessage: "No playable songs are available to export.",
  });
}
