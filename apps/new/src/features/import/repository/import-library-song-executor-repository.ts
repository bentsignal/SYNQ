import type { ImportSongDraft } from "../types/import-session";

export type ImportLibrarySongInsertValues = {
  duration: number | null;
  fileType: string | null;
  ingestComplete: 1;
  originalFileName: string;
  pathToFile: string;
  title: string;
};

export type ImportLibrarySongRowDependencies = {
  deleteAlbumSongRows: (songId: number) => Promise<void>;
  deleteArtistSongRows: (songId: number) => Promise<void>;
  deletePlaylistSongRows: (songId: number) => Promise<void>;
  deleteSongRow: (songId: number) => Promise<void>;
  insertSongRow: (values: ImportLibrarySongInsertValues) => Promise<number>;
  updateSongCover: ({
    coverImage,
    songId,
  }: {
    coverImage: string;
    songId: number;
  }) => Promise<void>;
  updateSongPath: ({
    pathToFile,
    songId,
  }: {
    pathToFile: string;
    songId: number;
  }) => Promise<void>;
};

export const getImportSongDraftInsertValues = (
  song: ImportSongDraft,
): ImportLibrarySongInsertValues => ({
  duration: song.duration,
  fileType: song.fileType,
  ingestComplete: 1,
  originalFileName: song.fileName,
  pathToFile: song.cacheUri,
  title: song.title,
});

export const insertImportSongDraftWithDependencies = (
  song: ImportSongDraft,
  dependencies: ImportLibrarySongRowDependencies,
) => dependencies.insertSongRow(getImportSongDraftInsertValues(song));

export const updateImportLibrarySongCoverWithDependencies = (
  params: {
    coverImage: string;
    songId: number;
  },
  dependencies: ImportLibrarySongRowDependencies,
) => dependencies.updateSongCover(params);

export const updateImportLibrarySongPathWithDependencies = (
  params: {
    pathToFile: string;
    songId: number;
  },
  dependencies: ImportLibrarySongRowDependencies,
) => dependencies.updateSongPath(params);

export const deleteImportLibrarySongRowsWithDependencies = async (
  songId: number,
  dependencies: ImportLibrarySongRowDependencies,
) => {
  await dependencies.deleteAlbumSongRows(songId);
  await dependencies.deleteArtistSongRows(songId);
  await dependencies.deletePlaylistSongRows(songId);
  await dependencies.deleteSongRow(songId);
};
