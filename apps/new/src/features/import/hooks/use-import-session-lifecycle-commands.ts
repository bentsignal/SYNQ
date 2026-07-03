import { useCallback, useMemo } from "react";
import {
  discardImportSession,
  saveImportSessionToLibrary,
} from "../services/import-library-save-service";
import { clearImportCache } from "../services/import-file-cache-service";
import { clearPersistedImportSessionState } from "../services/import-session-persistence-service";
import {
  getImportSessionCommandErrorMessage,
} from "../services/import-session-command-service";
import type { ImportSessionAction } from "../services/import-session-state-service";
import type {
  ImportSaveSummary,
  ImportSessionState,
} from "../types/import-session";

type UseImportSessionLifecycleCommandsParams = {
  dispatch: (action: ImportSessionAction) => void;
  shouldSaveToLibrary: boolean;
  songs: ImportSessionState["songs"];
};

export function useImportSessionLifecycleCommands({
  dispatch,
  shouldSaveToLibrary,
  songs,
}: UseImportSessionLifecycleCommandsParams) {
  const finishSession = useCallback(
    (summary: ImportSaveSummary) => {
      dispatch({ summary, type: "finish" });
    },
    [dispatch],
  );

  const saveImportSession = useCallback(async () => {
    dispatch({ type: "saving" });

    try {
      const summary = shouldSaveToLibrary
        ? await saveImportSessionToLibrary(songs)
        : await discardImportSession(songs);

      await clearPersistedImportSessionState();
      dispatch({ summary, type: "finish" });
      return true;
    } catch (caughtError) {
      dispatch({
        error: getImportSessionCommandErrorMessage({
          caughtError,
          mutation: "save-session",
        }),
        type: "fail",
      });
      return false;
    }
  }, [dispatch, shouldSaveToLibrary, songs]);

  const discardSession = useCallback(async () => {
    dispatch({ type: "saving" });

    try {
      await clearImportCache();
      await clearPersistedImportSessionState();
      dispatch({ type: "discard" });
      return true;
    } catch (caughtError) {
      dispatch({
        error: getImportSessionCommandErrorMessage({
          caughtError,
          mutation: "discard-session",
        }),
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
      discardSession,
      finishSession,
      resetSession,
      saveImportSession,
    }),
    [discardSession, finishSession, resetSession, saveImportSession],
  );
}
