import type { ImportSongDraft } from "../types/import-session";

type ImportSongLibraryLinkResult = {
  linkedAlbum: boolean;
};

export type ImportLibrarySongSaveDependencies = {
  deleteImportLibrarySongRows: (songId: number) => Promise<void>;
  deleteLibrarySongFiles: (songId: number) => Promise<void>;
  insertImportSongDraft: (song: ImportSongDraft) => Promise<number>;
  linkImportSongToLibrary: ({
    song,
    songId,
  }: {
    song: ImportSongDraft;
    songId: number;
  }) => Promise<ImportSongLibraryLinkResult>;
  moveImportAudioToLibrary: ({
    cacheUri,
    fileName,
    songId,
  }: {
    cacheUri: string;
    fileName: string;
    songId: number;
  }) => Promise<string>;
  saveCoverImage: (artwork: string | null) => Promise<string | null>;
  updateImportLibrarySongCover: ({
    coverImage,
    songId,
  }: {
    coverImage: string;
    songId: number;
  }) => Promise<void>;
  updateImportLibrarySongPath: ({
    pathToFile,
    songId,
  }: {
    pathToFile: string;
    songId: number;
  }) => Promise<void>;
};

const getErrorMessage = (error: unknown) =>
  error instanceof Error ? error.message : String(error);

const deleteLibrarySong = async (
  songId: number,
  dependencies: ImportLibrarySongSaveDependencies,
) => {
  await dependencies.deleteImportLibrarySongRows(songId);
  await dependencies.deleteLibrarySongFiles(songId);
};

const updateSongCover = async ({
  artwork,
  dependencies,
  songId,
}: {
  artwork: string | null;
  dependencies: ImportLibrarySongSaveDependencies;
  songId: number;
}) => {
  const coverImage = await dependencies.saveCoverImage(artwork);

  if (!coverImage) {
    return;
  }

  await dependencies.updateImportLibrarySongCover({ coverImage, songId });
};

export const saveImportSongToLibrary = async (
  song: ImportSongDraft,
  dependencies: ImportLibrarySongSaveDependencies,
) => {
  const songId = await dependencies.insertImportSongDraft(song);

  try {
    const libraryPath = await dependencies.moveImportAudioToLibrary({
      cacheUri: song.cacheUri,
      fileName: song.fileName,
      songId,
    });
    await dependencies.updateImportLibrarySongPath({
      pathToFile: libraryPath,
      songId,
    });
  } catch (error) {
    await deleteLibrarySong(songId, dependencies);
    throw new Error(`Audio file could not be saved: ${getErrorMessage(error)}`);
  }

  const { linkedAlbum } = await dependencies.linkImportSongToLibrary({
    song,
    songId,
  });

  if (!linkedAlbum) {
    await updateSongCover({ artwork: song.artwork, dependencies, songId });
  }

  return songId;
};
