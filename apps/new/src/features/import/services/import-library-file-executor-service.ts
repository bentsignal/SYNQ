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

export const getImportLibraryDirectoryWithDependencies = (
  dependencies: Pick<ImportLibraryFileDependencies, "documentDirectory">,
) => {
  if (!dependencies.documentDirectory) {
    throw new Error("Document directory is unavailable.");
  }

  return `${dependencies.documentDirectory}library`;
};

export const getImportLibrarySongDirectory = ({
  libraryDirectory,
  songId,
}: {
  libraryDirectory: string;
  songId: number;
}) => `${libraryDirectory}/${songId}`;

export const getImportLibrarySongFile = ({
  fileName,
  songDirectory,
}: {
  fileName: string;
  songDirectory: string;
}) => `${songDirectory}/${fileName}`;

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
