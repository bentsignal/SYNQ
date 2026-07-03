import { useCallback, useMemo } from "react";
import { clearImportCache } from "../services/import-file-cache-service";
import {
  discardImportSession,
  saveImportSessionToLibrary,
} from "../services/import-library-save-service";
import {
  discardImportSessionLifecycle,
  getFinishImportSessionAction,
  resetImportSessionLifecycle,
  saveImportSessionLifecycle,
  type ImportSessionLifecycleDependencies,
} from "../services/import-session-lifecycle-service";
import { clearPersistedImportSessionState } from "../services/import-session-persistence-service";
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
  const dependencies = useMemo<ImportSessionLifecycleDependencies>(
    () => ({
      clearImportCache,
      clearPersistedImportSessionState,
      discardImportSession,
      saveImportSessionToLibrary,
    }),
    [],
  );

  const finishSession = useCallback(
    (summary: ImportSaveSummary) => {
      dispatch(getFinishImportSessionAction(summary));
    },
    [dispatch],
  );

  const saveImportSession = useCallback(async () => {
    dispatch({ type: "saving" });

    const result = await saveImportSessionLifecycle(
      {
        shouldSaveToLibrary,
        songs,
      },
      dependencies,
    );
    dispatch(result.action);
    return result.succeeded;
  }, [dependencies, dispatch, shouldSaveToLibrary, songs]);

  const discardSession = useCallback(async () => {
    dispatch({ type: "saving" });

    const result = await discardImportSessionLifecycle(dependencies);
    dispatch(result.action);
    return result.succeeded;
  }, [dependencies, dispatch]);

  const resetSession = useCallback(() => {
    dispatch(resetImportSessionLifecycle(dependencies));
  }, [dependencies, dispatch]);

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
