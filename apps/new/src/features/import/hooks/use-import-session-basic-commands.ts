import { useCallback, useMemo } from "react";
import {
  runBeginImportFilePickCommand,
  runFailImportSessionCommand,
  runReviewImportSongsCommand,
  runSetImportSaveToLibraryCommand,
  runUpdateImportSongCommand,
} from "../services/import-session-command-flow-service";
import type { ImportSessionAction } from "../services/import-session-state-service";
import type { ImportSongDraft } from "../types/import-session";

type UseImportSessionBasicCommandsParams = {
  dispatch: (action: ImportSessionAction) => void;
};

export function useImportSessionBasicCommands({
  dispatch,
}: UseImportSessionBasicCommandsParams) {
  const beginFilePick = useCallback(() => {
    runBeginImportFilePickCommand({ dispatch });
  }, [dispatch]);

  const failSession = useCallback((error: string) => {
    runFailImportSessionCommand({ dispatch, error });
  }, [dispatch]);

  const reviewSongs = useCallback((songs: ImportSongDraft[]) => {
    runReviewImportSongsCommand({ dispatch, songs });
  }, [dispatch]);

  const setShouldSaveToLibrary = useCallback(
    (shouldSaveToLibrary: boolean) => {
      runSetImportSaveToLibraryCommand({ dispatch, shouldSaveToLibrary });
    },
    [dispatch],
  );

  const updateImportSong = useCallback((song: ImportSongDraft) => {
    runUpdateImportSongCommand({ dispatch, song });
  }, [dispatch]);

  return useMemo(
    () => ({
      beginFilePick,
      failSession,
      reviewSongs,
      setShouldSaveToLibrary,
      updateImportSong,
    }),
    [
      beginFilePick,
      failSession,
      reviewSongs,
      setShouldSaveToLibrary,
      updateImportSong,
    ],
  );
}
