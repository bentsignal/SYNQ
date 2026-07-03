import { useCallback } from "react";
import { deleteImportDraftCacheFiles } from "../services/import-file-cache-service";
import { selectImportFiles } from "../services/import-file-service";
import { getImportFileCommandErrorMessage } from "../services/import-file-command-service";
import {
  getBeginFilePickAction,
  getFailImportSessionAction,
  getRemoveImportSongsAction,
  getReviewImportSongsAction,
} from "../services/import-session-command-service";
import type { ImportSessionAction } from "../services/import-session-state-service";
import type { ImportSongDraft } from "../types/import-session";

export function useImportFileCommands({
  dispatch,
  songs,
}: {
  dispatch: (action: ImportSessionAction) => void;
  songs: ImportSongDraft[];
}) {
  const startFileImport = useCallback(async () => {
    dispatch(getBeginFilePickAction());

    try {
      const { drafts, skipped } = await selectImportFiles();

      if (drafts.length === 0) {
        dispatch(
          getFailImportSessionAction(
            skipped > 0
              ? "No selected songs could be staged for import."
              : "File selection was cancelled.",
          ),
        );
        return false;
      }

      dispatch(getReviewImportSongsAction(drafts));
      return true;
    } catch (caughtError) {
      dispatch(
        getFailImportSessionAction(
          getImportFileCommandErrorMessage({
            caughtError,
            mutation: "select-files",
          }),
        ),
      );
      return false;
    }
  }, [dispatch]);

  const removeImportSongs = useCallback(
    async (songIds: number[]) => {
      const songIdSet = new Set(songIds);
      const songsToRemove = songs.filter((song) => songIdSet.has(song.id));

      try {
        await deleteImportDraftCacheFiles(songsToRemove);
        dispatch(getRemoveImportSongsAction(songIds));
        return true;
      } catch (caughtError) {
        dispatch(
          getFailImportSessionAction(
            getImportFileCommandErrorMessage({
              caughtError,
              mutation: "remove-staged-songs",
            }),
          ),
        );
        return false;
      }
    },
    [dispatch, songs],
  );

  return {
    removeImportSongs,
    startFileImport,
  };
}
