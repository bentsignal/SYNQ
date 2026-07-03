export type LibrarySongFileDependencies = {
  deletePath: (
    path: string,
    options?: { idempotent?: boolean },
  ) => Promise<void>;
  documentDirectory: string | null;
};

export const getLibrarySongDirectoryPath = ({
  documentDirectory,
  songId,
}: {
  documentDirectory: string;
  songId: number;
}) => `${documentDirectory}library/${songId}`;

export const deleteLibrarySongFilesWithDependencies = async (
  songId: number,
  dependencies: LibrarySongFileDependencies,
) => {
  if (!dependencies.documentDirectory) {
    return;
  }

  await dependencies.deletePath(
    getLibrarySongDirectoryPath({
      documentDirectory: dependencies.documentDirectory,
      songId,
    }),
    { idempotent: true },
  );
};
