export const getImportLibraryDirectoryWithDependencies = (
  dependencies: { documentDirectory: string | null },
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
