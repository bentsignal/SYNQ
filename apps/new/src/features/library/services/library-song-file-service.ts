import * as FileSystem from "expo-file-system/legacy";
import {
  deleteLibrarySongFilesWithDependencies,
  type LibrarySongFileDependencies,
} from "./library-song-file-executor-service";

const librarySongFileDependencies: LibrarySongFileDependencies = {
  deletePath: FileSystem.deleteAsync,
  documentDirectory: FileSystem.documentDirectory,
};

export const deleteLibrarySongFiles = async (songId: number) => {
  await deleteLibrarySongFilesWithDependencies(
    songId,
    librarySongFileDependencies,
  );
};
