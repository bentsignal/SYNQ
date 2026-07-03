import { useCallback, useMemo } from "react";
import {
  runBeginImportFilePickCommand,
  runFailImportSessionCommand,
  runReviewImportSongsCommand,
  runSetImportSaveToLibraryCommand,
  runUpdateImportSongCommand,
} from "../services/import-session-command-flow-service";
import type { ImportSessionAction } from "../services/import-session-state-service";
import type { ImportSessionState, ImportSongDraft } from "../types/import-session";
import { useImportFileCommands } from "./use-import-file-commands";
import { useImportSessionLifecycleCommands } from "./use-import-session-lifecycle-commands";
import { useImportSessionWifiCommands } from "./use-import-session-wifi-commands";

type UseImportSessionCommandsParams = {
  dispatch: (action: ImportSessionAction) => void;
  state: ImportSessionState;
};

export function useImportSessionCommands({
  dispatch,
  state,
}: UseImportSessionCommandsParams) {
  const { removeImportSongs, startFileImport } = useImportFileCommands({
    dispatch,
    songs: state.songs,
  });

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

  const { beginWifiTransfer, finishWifiTransfer, receiveWifiSong } =
    useImportSessionWifiCommands({
      dispatch,
      songs: state.songs,
    });

  const { discardSession, finishSession, resetSession, saveImportSession } =
    useImportSessionLifecycleCommands({
      dispatch,
      shouldSaveToLibrary: state.shouldSaveToLibrary,
      songs: state.songs,
    });

  return useMemo(
    () => ({
      beginFilePick,
      beginWifiTransfer,
      discardSession,
      failSession,
      finishSession,
      finishWifiTransfer,
      receiveWifiSong,
      removeImportSongs,
      resetSession,
      reviewSongs,
      saveImportSession,
      startFileImport,
      setShouldSaveToLibrary,
      updateImportSong,
    }),
    [
      beginFilePick,
      beginWifiTransfer,
      discardSession,
      failSession,
      finishSession,
      finishWifiTransfer,
      receiveWifiSong,
      removeImportSongs,
      resetSession,
      reviewSongs,
      saveImportSession,
      startFileImport,
      setShouldSaveToLibrary,
      updateImportSong,
    ],
  );
}

export type ImportSessionCommands = ReturnType<typeof useImportSessionCommands>;
