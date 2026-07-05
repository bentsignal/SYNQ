import { getLibrarySongDirectoryPath } from "./library-song-file-path-service";

export type LibrarySongFileDependencies = {
  deletePath: (
    path: string,
    options?: { idempotent?: boolean },
  ) => Promise<void>;
  documentDirectory: string | null;
};

export { getLibrarySongDirectoryPath } from "./library-song-file-path-service";

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
