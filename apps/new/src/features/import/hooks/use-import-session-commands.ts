import { useCallback, useMemo } from "react";
import {
  discardImportSession,
  saveImportSessionToLibrary,
} from "../services/import-library-save-service";
import {
  clearImportCache,
  prepareWifiImportCache,
} from "../services/import-file-service";
import { clearPersistedImportSessionState } from "../services/import-session-persistence-service";
import type { ImportSessionAction } from "../services/import-session-state-service";
import type {
  ImportSaveSummary,
  ImportSessionState,
  ImportSongDraft,
} from "../types/import-session";
import { useImportFileCommands } from "./use-import-file-commands";

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

  const beginWifiTransfer = useCallback(async (total: number) => {
    try {
      await prepareWifiImportCache();
      dispatch({ total, type: "begin-wifi-transfer" });
      return true;
    } catch (caughtError) {
      dispatch({
        error:
          caughtError instanceof Error
            ? caughtError.message
            : "Wi-Fi import cache could not be prepared.",
        type: "fail",
      });
      return false;
    }
  }, [dispatch]);

  const failSession = useCallback((error: string) => {
    dispatch({ error, type: "fail" });
  }, [dispatch]);

  const reviewSongs = useCallback((songs: ImportSongDraft[]) => {
    dispatch({ songs, type: "review" });
  }, [dispatch]);

  const receiveWifiSong = useCallback((song: ImportSongDraft) => {
    dispatch({ song, type: "receive-wifi-song" });
  }, [dispatch]);

  const finishWifiTransfer = useCallback(() => {
    if (state.songs.length > 0) {
      dispatch({ songs: state.songs, type: "review" });
      return;
    }

    dispatch({ error: "No Wi-Fi songs were received.", type: "fail" });
  }, [dispatch, state.songs]);

  const setShouldSaveToLibrary = useCallback(
    (shouldSaveToLibrary: boolean) => {
      dispatch({ shouldSaveToLibrary, type: "set-save-to-library" });
    },
    [dispatch],
  );

  const updateImportSong = useCallback((song: ImportSongDraft) => {
    dispatch({ song, type: "update-song" });
  }, [dispatch]);

  const finishSession = useCallback((summary: ImportSaveSummary) => {
    dispatch({ summary, type: "finish" });
  }, [dispatch]);

  const saveImportSession = useCallback(async () => {
    dispatch({ type: "saving" });

    try {
      const summary = state.shouldSaveToLibrary
        ? await saveImportSessionToLibrary(state.songs)
        : await discardImportSession(state.songs);

      await clearPersistedImportSessionState();
      dispatch({ summary, type: "finish" });
      return true;
    } catch (caughtError) {
      dispatch({
        error:
          caughtError instanceof Error
            ? caughtError.message
            : "Import session could not be saved.",
        type: "fail",
      });
      return false;
    }
  }, [dispatch, state.shouldSaveToLibrary, state.songs]);

  const discardSession = useCallback(async () => {
    dispatch({ type: "saving" });

    try {
      await clearImportCache();
      await clearPersistedImportSessionState();
      dispatch({ type: "discard" });
      return true;
    } catch (caughtError) {
      dispatch({
        error:
          caughtError instanceof Error
            ? caughtError.message
            : "Import session could not be discarded.",
        type: "fail",
      });
      return false;
    }
  }, [dispatch]);

  const resetSession = useCallback(() => {
    void clearPersistedImportSessionState();
    dispatch({ type: "reset" });
  }, [dispatch]);

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
