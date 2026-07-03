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
  discardImportSongs,
  saveImportSongsToLibrary,
  type ImportLibrarySessionSaveDependencies,
} from "./import-library-session-save-executor-service";

const importLibrarySessionSaveDependencies: ImportLibrarySessionSaveDependencies =
  {
    deleteImportDraftCacheFiles,
    deleteImportLibrarySongRows,
    deleteLibrarySongFiles,
    insertImportSongDraft,
    linkImportSongToLibrary,
    moveImportAudioToLibrary,
    saveCoverImage,
    updateImportLibrarySongCover,
    updateImportLibrarySongPath,
  };

const importDraftDiscardDependencies = {
  deleteImportDraftCacheFiles,
};

export async function saveImportSessionToLibrary(
  songs: ImportSongDraft[],
): Promise<ImportSaveSummary> {
  return saveImportSongsToLibrary(songs, importLibrarySessionSaveDependencies);
}

export async function discardImportSession(
  songs: ImportSongDraft[],
): Promise<ImportSaveSummary> {
  return discardImportSongs(songs, importDraftDiscardDependencies);
}
