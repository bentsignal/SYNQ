import { PageType, type SongType } from "@/src/constants/Types";
import { deleteLibrarySong } from "@/src/features/library/repository/library-song-repository";
import { removeTracksBySongIds } from "@/src/features/playback/lib/player-queue-actions-service";
import { removeImportSongs } from "./import-song-edits";

type ExecuteImportDeleteActionInput = {
  editSong: SongType;
  results: SongType[];
  selectedSongs: number[];
};

type ExecuteImportDeleteActionResult = {
  deletedLibrarySong: boolean;
  nextResults: SongType[] | null;
  shouldDisableExport: boolean;
  shouldLeaveImport: boolean;
};

const getImportDeleteIds = (editSong: SongType, selectedSongs: number[]) => {
  if (selectedSongs.length > 0) {
    return selectedSongs;
  }

  if (editSong.pageType === PageType.IMPORT) {
    return [editSong.id];
  }

  return [];
};

export async function executeImportDeleteAction({
  editSong,
  results,
  selectedSongs,
}: ExecuteImportDeleteActionInput): Promise<ExecuteImportDeleteActionResult> {
  const importDeleteIds = getImportDeleteIds(editSong, selectedSongs);

  if (importDeleteIds.length > 0) {
    const nextResults = await removeImportSongs(results, importDeleteIds);

    return {
      deletedLibrarySong: false,
      nextResults,
      shouldDisableExport: nextResults.length <= 0,
      shouldLeaveImport: nextResults.length === 0,
    };
  }

  if (editSong.pageType === PageType.LIBRARY) {
    await deleteLibrarySong(editSong.id);
    await removeTracksBySongIds([editSong.id]);

    return {
      deletedLibrarySong: true,
      nextResults: null,
      shouldDisableExport: false,
      shouldLeaveImport: false,
    };
  }

  return {
    deletedLibrarySong: false,
    nextResults: null,
    shouldDisableExport: false,
    shouldLeaveImport: false,
  };
}
