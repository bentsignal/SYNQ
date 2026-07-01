import { PageType, type SongType } from "@/src/constants/Types";
import { removeImportSongs } from "@/src/features/import/lib/import-song-edits";
import { deleteLibrarySong } from "@/src/features/library/repository/library-song-repository";
import { posthog } from "@/src/lib/posthog";
import { router } from "expo-router";

type ExecuteSongDeleteActionInput = {
  editSong: Pick<SongType, "id" | "pageType">;
  results: SongType[];
  selectedSongIds: number[];
  removeSongsFromQueue: (ids: number[]) => Promise<void>;
  setExportDisabled: (disabled: boolean) => void;
  setResults: (songs: SongType[]) => void;
  onLibrarySongDeleted: () => void;
};

export async function executeSongDeleteAction({
  editSong,
  results,
  selectedSongIds,
  removeSongsFromQueue,
  setExportDisabled,
  setResults,
  onLibrarySongDeleted,
}: ExecuteSongDeleteActionInput) {
  posthog.capture("delete_song");

  if (selectedSongIds.length > 0) {
    const newResults = await removeImportSongs(results, selectedSongIds);
    if (newResults.length <= 0) {
      setExportDisabled(true);
      router.replace("/(tabs)");
    }
    setResults(newResults);
    return;
  }

  if (editSong.pageType === PageType.LIBRARY) {
    await deleteLibrarySong(editSong.id);
    await removeSongsFromQueue([editSong.id]);
    onLibrarySongDeleted();
    return;
  }

  if (editSong.pageType === PageType.IMPORT) {
    const newResults = await removeImportSongs(results, [editSong.id]);
    if (newResults.length <= 0) {
      setExportDisabled(true);
    }
    if (newResults.length === 0) {
      router.replace("/(tabs)");
    }
    setResults(newResults);
  }
}
