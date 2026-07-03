import { useCallback, useMemo } from "react";
import {
  getBeginFilePickAction,
  getFailImportSessionAction,
  getReviewImportSongsAction,
  getSetImportSaveToLibraryAction,
  getUpdateImportSongAction,
} from "../services/import-session-command-service";
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
    dispatch(getBeginFilePickAction());
  }, [dispatch]);

  const failSession = useCallback((error: string) => {
    dispatch(getFailImportSessionAction(error));
  }, [dispatch]);

  const reviewSongs = useCallback((songs: ImportSongDraft[]) => {
    dispatch(getReviewImportSongsAction(songs));
  }, [dispatch]);

  const setShouldSaveToLibrary = useCallback(
    (shouldSaveToLibrary: boolean) => {
      dispatch(getSetImportSaveToLibraryAction(shouldSaveToLibrary));
    },
    [dispatch],
  );

  const updateImportSong = useCallback((song: ImportSongDraft) => {
    dispatch(getUpdateImportSongAction(song));
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
