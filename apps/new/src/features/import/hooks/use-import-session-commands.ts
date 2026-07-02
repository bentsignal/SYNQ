import { useCallback, useMemo } from "react";
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
    dispatch({ type: "begin-file-pick" });
  }, [dispatch]);

  const failSession = useCallback((error: string) => {
    dispatch({ error, type: "fail" });
  }, [dispatch]);

  const reviewSongs = useCallback((songs: ImportSongDraft[]) => {
    dispatch({ songs, type: "review" });
  }, [dispatch]);

  const setShouldSaveToLibrary = useCallback(
    (shouldSaveToLibrary: boolean) => {
      dispatch({ shouldSaveToLibrary, type: "set-save-to-library" });
    },
    [dispatch],
  );

  const updateImportSong = useCallback((song: ImportSongDraft) => {
    dispatch({ song, type: "update-song" });
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
