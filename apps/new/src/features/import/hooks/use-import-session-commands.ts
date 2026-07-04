import { useMemo } from "react";
import type { ImportSessionAction } from "../services/import-session-state-service";
import type { ImportSessionState } from "../types/import-session";
import { useImportFileCommands } from "./use-import-file-commands";
import { useImportSessionBasicCommands } from "./use-import-session-basic-commands";
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
  const {
    beginFilePick,
    failSession,
    reviewSongs,
    setShouldSaveToLibrary,
    updateImportSong,
  } = useImportSessionBasicCommands({ dispatch });
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
