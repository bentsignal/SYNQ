import {
  getImportLibraryDirectoryWithDependencies,
  getImportLibrarySongDirectory,
  getImportLibrarySongFile,
} from "./import-library-file-path-service";

export {
  getImportLibraryDirectoryWithDependencies,
  getImportLibrarySongDirectory,
  getImportLibrarySongFile,
} from "./import-library-file-path-service";

export type ImportLibraryFileDependencies = {
  copyFile: ({ from, to }: { from: string; to: string }) => Promise<void>;
  deletePath: (
    path: string,
    options?: { idempotent?: boolean },
  ) => Promise<void>;
  documentDirectory: string | null;
  makeDirectory: (
    path: string,
    options?: { intermediates?: boolean },
  ) => Promise<void>;
};

export const deleteLibrarySongFilesWithDependencies = async (
  songId: number,
  dependencies: ImportLibraryFileDependencies,
) => {
  if (!dependencies.documentDirectory) {
    return;
  }

  await dependencies.deletePath(
    getImportLibrarySongDirectory({
      libraryDirectory: getImportLibraryDirectoryWithDependencies(dependencies),
      songId,
    }),
    { idempotent: true },
  );
};

export const moveImportAudioToLibraryWithDependencies = async ({
  cacheUri,
  dependencies,
  fileName,
  songId,
}: {
  cacheUri: string;
  dependencies: ImportLibraryFileDependencies;
  fileName: string;
  songId: number;
}) => {
  const libraryDirectory =
    getImportLibraryDirectoryWithDependencies(dependencies);
  await dependencies.makeDirectory(libraryDirectory, {
    intermediates: true,
  });

  const songDirectory = getImportLibrarySongDirectory({
    libraryDirectory,
    songId,
  });
  await dependencies.makeDirectory(songDirectory, { intermediates: true });

  const destination = getImportLibrarySongFile({ fileName, songDirectory });
  await dependencies.copyFile({
    from: cacheUri,
    to: destination,
  });
  await dependencies.deletePath(cacheUri, { idempotent: true });

  return destination;
};
