import * as FileSystem from "expo-file-system";
import {
  deleteLibrarySongFilesWithDependencies,
  moveImportAudioToLibraryWithDependencies,
  type ImportLibraryFileDependencies,
} from "./import-library-file-executor-service";

const importLibraryFileDependencies: ImportLibraryFileDependencies = {
  copyFile: FileSystem.copyAsync,
  deletePath: FileSystem.deleteAsync,
  documentDirectory: FileSystem.documentDirectory,
  makeDirectory: FileSystem.makeDirectoryAsync,
};

export const deleteLibrarySongFiles = async (songId: number) => {
  await deleteLibrarySongFilesWithDependencies(
    songId,
    importLibraryFileDependencies,
  );
};

export const moveImportAudioToLibrary = async ({
  cacheUri,
  fileName,
  songId,
}: {
  cacheUri: string;
  fileName: string;
  songId: number;
}) => {
  return moveImportAudioToLibraryWithDependencies({
    cacheUri,
    dependencies: importLibraryFileDependencies,
    fileName,
    songId,
  });
};
