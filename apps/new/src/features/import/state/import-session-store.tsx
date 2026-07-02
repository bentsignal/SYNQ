import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useReducer,
  type ReactNode,
} from "react";
import {
  discardImportSession,
  saveImportSessionToLibrary,
} from "../services/import-library-save-service";
import {
  clearImportCache,
  deleteImportDraftCacheFiles,
  prepareWifiImportCache,
  selectImportFiles,
} from "../services/import-file-service";
import {
  clearPersistedImportSessionState,
  loadPersistedImportSessionState,
  savePersistedImportSessionState,
} from "../services/import-session-persistence-service";
import {
  importSessionReducer,
  initialImportSessionState,
} from "../services/import-session-state-service";
import type {
  ImportSaveSummary,
  ImportSessionState,
  ImportSongDraft,
} from "../types/import-session";

type ImportSessionCommands = {
  beginFilePick: () => void;
  beginWifiTransfer: (total: number) => Promise<boolean>;
  discardSession: () => Promise<boolean>;
  failSession: (error: string) => void;
  finishSession: (summary: ImportSaveSummary) => void;
  finishWifiTransfer: () => void;
  receiveWifiSong: (song: ImportSongDraft) => void;
  removeImportSongs: (songIds: number[]) => Promise<boolean>;
  resetSession: () => void;
  reviewSongs: (songs: ImportSongDraft[]) => void;
  saveImportSession: () => Promise<boolean>;
  startFileImport: () => Promise<boolean>;
  setShouldSaveToLibrary: (shouldSaveToLibrary: boolean) => void;
  updateImportSong: (song: ImportSongDraft) => void;
};

type ImportSessionValue = ImportSessionCommands & {
  state: ImportSessionState;
};

const ImportSessionContext = createContext<ImportSessionValue | null>(null);

export function ImportSessionProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(
    importSessionReducer,
    initialImportSessionState,
  );

  useEffect(() => {
    let cancelled = false;

    const hydrateImportSession = async () => {
      const persistedState = await loadPersistedImportSessionState();

      if (!cancelled && persistedState) {
        dispatch({ state: persistedState, type: "hydrate" });
      }
    };

    void hydrateImportSession();

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (state.phase === "processing" || state.phase === "reviewing") {
      void savePersistedImportSessionState(state);
      return;
    }

    if (state.phase === "idle" && state.songs.length === 0) {
      void clearPersistedImportSessionState();
    }
  }, [state]);

  const beginFilePick = useCallback(() => {
    dispatch({ type: "begin-file-pick" });
  }, []);
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
  }, []);
  const failSession = useCallback((error: string) => {
    dispatch({ error, type: "fail" });
  }, []);
  const reviewSongs = useCallback((songs: ImportSongDraft[]) => {
    dispatch({ songs, type: "review" });
  }, []);
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
        error:
          caughtError instanceof Error
            ? caughtError.message
            : "Files could not be selected.",
        type: "fail",
      });
      return false;
    }
  }, []);
  const removeImportSongs = useCallback(
    async (songIds: number[]) => {
      const songIdSet = new Set(songIds);
      const songsToRemove = state.songs.filter((song) => songIdSet.has(song.id));

      try {
        await deleteImportDraftCacheFiles(songsToRemove);
        dispatch({ songIds, type: "remove-songs" });
        return true;
      } catch (caughtError) {
        dispatch({
          error:
            caughtError instanceof Error
              ? caughtError.message
              : "Selected staged songs could not be removed.",
          type: "fail",
        });
        return false;
      }
    },
    [state.songs],
  );
  const receiveWifiSong = useCallback((song: ImportSongDraft) => {
    dispatch({ song, type: "receive-wifi-song" });
  }, []);
  const finishWifiTransfer = useCallback(() => {
    if (state.songs.length > 0) {
      dispatch({ songs: state.songs, type: "review" });
      return;
    }

    dispatch({ error: "No Wi-Fi songs were received.", type: "fail" });
  }, [state.songs]);
  const setShouldSaveToLibrary = useCallback(
    (shouldSaveToLibrary: boolean) => {
      dispatch({ shouldSaveToLibrary, type: "set-save-to-library" });
    },
    [],
  );
  const updateImportSong = useCallback((song: ImportSongDraft) => {
    dispatch({ song, type: "update-song" });
  }, []);
  const finishSession = useCallback((summary: ImportSaveSummary) => {
    dispatch({ summary, type: "finish" });
  }, []);
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
  }, [state.shouldSaveToLibrary, state.songs]);
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
  }, []);
  const resetSession = useCallback(() => {
    void clearPersistedImportSessionState();
    dispatch({ type: "reset" });
  }, []);

  const value = useMemo<ImportSessionValue>(
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
      state,
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
      state,
      updateImportSong,
    ],
  );

  return (
    <ImportSessionContext.Provider value={value}>
      {children}
    </ImportSessionContext.Provider>
  );
}

export function useImportSession() {
  const value = useContext(ImportSessionContext);

  if (!value) {
    throw new Error("useImportSession must be used inside ImportSessionProvider.");
  }

  return value;
}
