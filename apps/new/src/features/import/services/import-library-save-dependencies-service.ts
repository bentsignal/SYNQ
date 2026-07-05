import { saveCoverImage } from "../../images/services/image-storage-service";
import {
  deleteImportLibrarySongRows,
  insertImportSongDraft,
  updateImportLibrarySongCover,
  updateImportLibrarySongPath,
} from "../repository/import-library-song-repository";
import { deleteImportDraftCacheFiles } from "./import-file-cache-service";
import {
  deleteLibrarySongFiles,
  moveImportAudioToLibrary,
} from "./import-library-file-service";
import { linkImportSongToLibrary } from "./import-library-link-service";
import type { ImportLibrarySessionSaveDependencies } from "./import-library-session-save-executor-service";

export function getImportLibrarySessionSaveDependencies(): ImportLibrarySessionSaveDependencies {
  return {
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
}

export function getImportDraftDiscardDependencies() {
  return {
    deleteImportDraftCacheFiles,
  };
}
