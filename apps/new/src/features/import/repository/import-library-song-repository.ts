import type { ImportSongDraft } from "../types/import-session";
import {
  deleteImportLibrarySongRowsWithDependencies,
  insertImportSongDraftWithDependencies,
  updateImportLibrarySongCoverWithDependencies,
  updateImportLibrarySongPathWithDependencies,
  type ImportLibrarySongRowDependencies,
} from "./import-library-song-executor-repository";
import {
  deleteImportLibraryAlbumSongRows,
  deleteImportLibraryArtistSongRows,
  deleteImportLibraryPlaylistSongRows,
} from "./import-library-song-relationship-repository";
import {
  deleteImportLibrarySongRow,
  insertImportLibrarySongRow,
  updateImportLibrarySongRowCover,
  updateImportLibrarySongRowPath,
} from "./import-library-song-row-repository";

const importLibrarySongRowDependencies: ImportLibrarySongRowDependencies = {
  deleteAlbumSongRows: deleteImportLibraryAlbumSongRows,
  deleteArtistSongRows: deleteImportLibraryArtistSongRows,
  deletePlaylistSongRows: deleteImportLibraryPlaylistSongRows,
  deleteSongRow: deleteImportLibrarySongRow,
  insertSongRow: insertImportLibrarySongRow,
  updateSongCover: updateImportLibrarySongRowCover,
  updateSongPath: updateImportLibrarySongRowPath,
};

export const insertImportSongDraft = async (song: ImportSongDraft) =>
  insertImportSongDraftWithDependencies(
    song,
    importLibrarySongRowDependencies,
  );

export const updateImportLibrarySongCover = async ({
  coverImage,
  songId,
}: {
  coverImage: string;
  songId: number;
}) => {
  await updateImportLibrarySongCoverWithDependencies(
    { coverImage, songId },
    importLibrarySongRowDependencies,
  );
};

export const updateImportLibrarySongPath = async ({
  pathToFile,
  songId,
}: {
  pathToFile: string;
  songId: number;
}) => {
  await updateImportLibrarySongPathWithDependencies(
    { pathToFile, songId },
    importLibrarySongRowDependencies,
  );
};

export const deleteImportLibrarySongRows = async (songId: number) => {
  await deleteImportLibrarySongRowsWithDependencies(
    songId,
    importLibrarySongRowDependencies,
  );
};
