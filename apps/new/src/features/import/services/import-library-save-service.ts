import { saveCoverImage } from "../../images/services/image-storage-service";
import {
  deleteImportLibrarySongRows,
  insertImportSongDraft,
  updateImportLibrarySongCover,
  updateImportLibrarySongPath,
} from "../repository/import-library-song-repository";
import type {
  ImportSaveSummary,
  ImportSongDraft,
} from "../types/import-session";
import { deleteImportDraftCacheFiles } from "./import-file-cache-service";
import {
  deleteLibrarySongFiles,
  moveImportAudioToLibrary,
} from "./import-library-file-service";
import { linkImportSongToLibrary } from "./import-library-link-service";
import {
  saveImportSongToLibrary,
  type ImportLibrarySongSaveDependencies,
} from "./import-library-song-save-executor-service";

const importLibrarySongSaveDependencies: ImportLibrarySongSaveDependencies = {
  deleteImportLibrarySongRows,
  deleteLibrarySongFiles,
  insertImportSongDraft,
  linkImportSongToLibrary,
  moveImportAudioToLibrary,
  saveCoverImage,
  updateImportLibrarySongCover,
  updateImportLibrarySongPath,
};

export async function saveImportSessionToLibrary(
  songs: ImportSongDraft[],
): Promise<ImportSaveSummary> {
  const savedSongIds: number[] = [];

  for (const song of songs) {
    savedSongIds.push(
      await saveImportSongToLibrary(song, importLibrarySongSaveDependencies),
    );
  }

  return {
    discarded: 0,
    saved: savedSongIds.length,
    savedSongIds,
  };
}

export async function discardImportSession(
  songs: ImportSongDraft[],
): Promise<ImportSaveSummary> {
  await deleteImportDraftCacheFiles(songs);

  return {
    discarded: songs.length,
    saved: 0,
    savedSongIds: [],
  };
}
