import type {
  ImportLibrarySongSaveDependencies,
} from "./import-library-song-save-executor-service";
import {
  deleteFailedImportLibrarySong,
  getImportLibrarySongSaveErrorMessage,
} from "./import-library-song-save-step-service";

export const saveImportLibrarySongAudio = async ({
  cacheUri,
  dependencies,
  fileName,
  songId,
}: {
  cacheUri: string;
  dependencies: ImportLibrarySongSaveDependencies;
  fileName: string;
  songId: number;
}) => {
  try {
    const libraryPath = await dependencies.moveImportAudioToLibrary({
      cacheUri,
      fileName,
      songId,
    });
    await dependencies.updateImportLibrarySongPath({
      pathToFile: libraryPath,
      songId,
    });
  } catch (error) {
    await deleteFailedImportLibrarySong(songId, dependencies);
    throw new Error(
      `Audio file could not be saved: ${getImportLibrarySongSaveErrorMessage(
        error,
      )}`,
    );
  }
};
