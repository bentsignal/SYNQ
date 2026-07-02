import { useCallback } from "react";
import {
  deleteImportDraftCacheFiles,
  selectImportFiles,
} from "../services/import-file-service";
import { getImportFileCommandErrorMessage } from "../services/import-file-command-service";
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
    dispatch({ type: "begin-file-pick" });

    try {
      const { drafts, skipped } = await selectImportFiles();

      if (drafts.length === 0) {
        dispatch({
          error:
            skipped > 0
              ? "No selected songs could be staged for import."
              : "File selection was cancelled.",
          type: "fail",
        });
        return false;
      }

      dispatch({ songs: drafts, type: "review" });
      return true;
    } catch (caughtError) {
      dispatch({
        error: getImportFileCommandErrorMessage({
          caughtError,
          mutation: "select-files",
        }),
        type: "fail",
      });
      return false;
    }
  }, [dispatch]);

  const removeImportSongs = useCallback(
    async (songIds: number[]) => {
      const songIdSet = new Set(songIds);
      const songsToRemove = songs.filter((song) => songIdSet.has(song.id));

      try {
        await deleteImportDraftCacheFiles(songsToRemove);
        dispatch({ songIds, type: "remove-songs" });
        return true;
      } catch (caughtError) {
        dispatch({
          error: getImportFileCommandErrorMessage({
            caughtError,
            mutation: "remove-staged-songs",
          }),
          type: "fail",
        });
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
