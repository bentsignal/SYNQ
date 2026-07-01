import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useReducer,
  type ReactNode,
} from "react";
import {
  discardImportSession,
  saveImportSessionToLibrary,
} from "../services/import-library-save-service";
import { clearImportCache, selectImportFiles } from "../services/import-file-service";
import type {
  ImportSaveSummary,
  ImportSessionState,
  ImportSongDraft,
} from "../types/import-session";

type ImportSessionAction =
  | { type: "begin-file-pick" }
  | { error: string; type: "fail" }
  | { songs: ImportSongDraft[]; type: "review" }
  | { songIds: number[]; type: "remove-songs" }
  | { shouldSaveToLibrary: boolean; type: "set-save-to-library" }
  | { summary: ImportSaveSummary; type: "finish" }
  | { type: "saving" }
  | { type: "discard" }
  | { type: "reset" };

type ImportSessionCommands = {
  beginFilePick: () => void;
  discardSession: () => void;
  failSession: (error: string) => void;
  finishSession: (summary: ImportSaveSummary) => void;
  removeImportSongs: (songIds: number[]) => void;
  resetSession: () => void;
  reviewSongs: (songs: ImportSongDraft[]) => void;
  saveImportSession: () => Promise<boolean>;
  startFileImport: () => Promise<boolean>;
  setShouldSaveToLibrary: (shouldSaveToLibrary: boolean) => void;
};

type ImportSessionValue = ImportSessionCommands & {
  state: ImportSessionState;
};

const initialImportSessionState: ImportSessionState = {
  error: null,
  phase: "idle",
  progress: {
    current: 0,
    total: 0,
  },
  saveSummary: null,
  selectedSongId: null,
  shouldSaveToLibrary: true,
  songs: [],
  source: "files",
};

const ImportSessionContext = createContext<ImportSessionValue | null>(null);

const importSessionReducer = (
  state: ImportSessionState,
  action: ImportSessionAction,
): ImportSessionState => {
  switch (action.type) {
    case "begin-file-pick":
      return {
        ...state,
        error: null,
        phase: "picking",
        source: "files",
      };
    case "fail":
      return {
        ...state,
        error: action.error,
        phase: "failure",
      };
    case "review":
      return {
        ...state,
        error: null,
        phase: "reviewing",
        progress: {
          current: action.songs.length,
          total: action.songs.length,
        },
        saveSummary: null,
        selectedSongId: action.songs[0]?.id ?? null,
        songs: action.songs,
      };
    case "remove-songs": {
      const songIdSet = new Set(action.songIds);
      const songs = state.songs.filter((song) => !songIdSet.has(song.id));

      return {
        ...state,
        progress: {
          current: songs.length,
          total: songs.length,
        },
        selectedSongId: songs[0]?.id ?? null,
        songs,
      };
    }
    case "set-save-to-library":
      return {
        ...state,
        shouldSaveToLibrary: action.shouldSaveToLibrary,
      };
    case "saving":
      return {
        ...state,
        error: null,
        phase: state.shouldSaveToLibrary ? "saving" : "discarding",
        progress: {
          current: 0,
          total: state.songs.length,
        },
      };
    case "finish":
      return {
        ...state,
        error: null,
        phase: "success",
        progress: {
          current: action.summary.saved + action.summary.discarded,
          total: action.summary.saved + action.summary.discarded,
        },
        saveSummary: action.summary,
      };
    case "discard":
      return {
        ...initialImportSessionState,
        phase: "idle",
      };
    case "reset":
      return initialImportSessionState;
  }
};

export function ImportSessionProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(
    importSessionReducer,
    initialImportSessionState,
  );

  const beginFilePick = useCallback(() => {
    dispatch({ type: "begin-file-pick" });
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
  const removeImportSongs = useCallback((songIds: number[]) => {
    dispatch({ songIds, type: "remove-songs" });
  }, []);
  const setShouldSaveToLibrary = useCallback(
    (shouldSaveToLibrary: boolean) => {
      dispatch({ shouldSaveToLibrary, type: "set-save-to-library" });
    },
    [],
  );
  const finishSession = useCallback((summary: ImportSaveSummary) => {
    dispatch({ summary, type: "finish" });
  }, []);
  const saveImportSession = useCallback(async () => {
    dispatch({ type: "saving" });

    try {
      const summary = state.shouldSaveToLibrary
        ? await saveImportSessionToLibrary(state.songs)
        : await discardImportSession(state.songs);

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
  const discardSession = useCallback(() => {
    void clearImportCache();
    dispatch({ type: "discard" });
  }, []);
  const resetSession = useCallback(() => {
    dispatch({ type: "reset" });
  }, []);

  const value = useMemo<ImportSessionValue>(
    () => ({
      beginFilePick,
      discardSession,
      failSession,
      finishSession,
      removeImportSongs,
      resetSession,
      reviewSongs,
      saveImportSession,
      startFileImport,
      setShouldSaveToLibrary,
      state,
    }),
    [
      beginFilePick,
      discardSession,
      failSession,
      finishSession,
      removeImportSongs,
      resetSession,
      reviewSongs,
      saveImportSession,
      startFileImport,
      setShouldSaveToLibrary,
      state,
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
