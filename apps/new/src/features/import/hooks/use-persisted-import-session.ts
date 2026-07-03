import { useEffect } from "react";
import {
  clearPersistedImportSessionState,
  loadPersistedImportSessionState,
  savePersistedImportSessionState,
} from "../services/import-session-persistence-service";
import {
  runImportSessionHydrateCommand,
  runImportSessionPersistenceCommand,
} from "../services/import-session-persistence-command-flow-service";
import type { ImportSessionState } from "../types/import-session";

export type PersistedImportSessionDispatch = (action: {
  state: ImportSessionState;
  type: "hydrate";
}) => void;

export function usePersistedImportSession({
  dispatch,
  state,
}: {
  dispatch: PersistedImportSessionDispatch;
  state: ImportSessionState;
}) {
  useEffect(() => {
    let cancelled = false;

    void runImportSessionHydrateCommand({
      dispatch,
      isCurrent: () => !cancelled,
      loadPersistedImportSessionState,
    });

    return () => {
      cancelled = true;
    };
  }, [dispatch]);

  useEffect(() => {
    void runImportSessionPersistenceCommand({
      clearPersistedImportSessionState,
      savePersistedImportSessionState,
      state,
    });
  }, [state]);
}
