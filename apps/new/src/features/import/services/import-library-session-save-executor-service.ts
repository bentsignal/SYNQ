import type {
  ImportSaveSummary,
  ImportSongDraft,
} from "../types/import-session";
import type { ImportLibrarySongSaveDependencies } from "./import-library-song-save-executor-service";
import { saveImportSongToLibrary } from "./import-library-song-save-executor-service";

export type ImportLibrarySessionSaveDependencies =
  ImportLibrarySongSaveDependencies & {
    deleteImportDraftCacheFiles: (songs: ImportSongDraft[]) => Promise<void>;
  };

export async function saveImportSongsToLibrary(
  songs: ImportSongDraft[],
  dependencies: ImportLibrarySessionSaveDependencies,
): Promise<ImportSaveSummary> {
  const savedSongIds: number[] = [];

  for (const song of songs) {
    savedSongIds.push(await saveImportSongToLibrary(song, dependencies));
  }

  await dependencies.deleteImportDraftCacheFiles(songs);

  return {
    discarded: 0,
    saved: savedSongIds.length,
    savedSongIds,
  };
}

export async function discardImportSongs(
  songs: ImportSongDraft[],
  dependencies: Pick<
    ImportLibrarySessionSaveDependencies,
    "deleteImportDraftCacheFiles"
  >,
): Promise<ImportSaveSummary> {
  await dependencies.deleteImportDraftCacheFiles(songs);

  return {
    discarded: songs.length,
    saved: 0,
    savedSongIds: [],
  };
}
