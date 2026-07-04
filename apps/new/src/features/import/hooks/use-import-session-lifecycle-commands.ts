import { useCallback, useMemo } from "react";
import { clearImportCache } from "../services/import-file-cache-service";
import {
  discardImportSession,
  saveImportSessionToLibrary,
} from "../services/import-library-save-service";
import {
  type ImportSessionLifecycleDependencies,
} from "../services/import-session-lifecycle-service";
import {
  runDiscardImportSessionCommand,
  runFinishImportSessionCommand,
  runResetImportSessionCommand,
  runSaveImportSessionCommand,
} from "../services/import-session-lifecycle-command-flow-service";
import { clearPersistedImportSessionState } from "../services/import-session-persistence-service";
import type { ImportSessionAction } from "../services/import-session-state-service";
import type {
  ImportSaveSummary,
  ImportSessionState,
} from "../types/import-session";

type UseImportSessionLifecycleCommandsParams = {
  dispatch: (action: ImportSessionAction) => void;
  premiumActive: boolean;
  shouldSaveToLibrary: boolean;
  songs: ImportSessionState["songs"];
};

export function useImportSessionLifecycleCommands({
  dispatch,
  premiumActive,
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
      runFinishImportSessionCommand({
        dispatch,
        summary,
      });
    },
    [dispatch],
  );

  const saveImportSession = useCallback(async () => {
    return runSaveImportSessionCommand({
      dependencies,
      dispatch,
      premiumActive,
      shouldSaveToLibrary,
      songs,
    });
  }, [dependencies, dispatch, premiumActive, shouldSaveToLibrary, songs]);

  const discardSession = useCallback(async () => {
    return runDiscardImportSessionCommand({
      dependencies,
      dispatch,
    });
  }, [dependencies, dispatch]);

  const resetSession = useCallback(() => {
    runResetImportSessionCommand({
      dependencies,
      dispatch,
    });
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
