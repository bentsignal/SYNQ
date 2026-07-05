import type {
  ImportSaveSummary,
  ImportSongDraft,
} from "../types/import-session";
import {
  getImportDraftDiscardDependencies,
  getImportLibrarySessionSaveDependencies,
} from "./import-library-save-dependencies-service";
import {
  discardImportSongs,
  saveImportSongsToLibrary,
} from "./import-library-session-save-executor-service";

export async function saveImportSessionToLibrary(
  songs: ImportSongDraft[],
): Promise<ImportSaveSummary> {
  return saveImportSongsToLibrary(
    songs,
    getImportLibrarySessionSaveDependencies(),
  );
}

export async function discardImportSession(
  songs: ImportSongDraft[],
): Promise<ImportSaveSummary> {
  return discardImportSongs(songs, getImportDraftDiscardDependencies());
}
