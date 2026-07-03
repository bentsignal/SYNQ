export type ImportLibrarySongCleanupDependencies = {
  deleteImportLibrarySongRows: (songId: number) => Promise<void>;
  deleteLibrarySongFiles: (songId: number) => Promise<void>;
};

export type ImportLibrarySongCoverDependencies = {
  saveCoverImage: (artwork: string | null) => Promise<string | null>;
  updateImportLibrarySongCover: ({
    coverImage,
    songId,
  }: {
    coverImage: string;
    songId: number;
  }) => Promise<void>;
};

export const getImportLibrarySongSaveErrorMessage = (error: unknown) =>
  error instanceof Error ? error.message : String(error);

export const deleteFailedImportLibrarySong = async (
  songId: number,
  dependencies: ImportLibrarySongCleanupDependencies,
) => {
  await dependencies.deleteImportLibrarySongRows(songId);
  await dependencies.deleteLibrarySongFiles(songId);
};

export const updateImportLibrarySongCoverFromArtwork = async ({
  artwork,
  dependencies,
  songId,
}: {
  artwork: string | null;
  dependencies: ImportLibrarySongCoverDependencies;
  songId: number;
}) => {
  const coverImage = await dependencies.saveCoverImage(artwork);

  if (!coverImage) {
    return;
  }

  await dependencies.updateImportLibrarySongCover({ coverImage, songId });
};
