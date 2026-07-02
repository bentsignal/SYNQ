import { useEffect } from "react";
import {
  clearPersistedImportSessionState,
  loadPersistedImportSessionState,
  savePersistedImportSessionState,
} from "../services/import-session-persistence-service";
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
  }, [dispatch]);

  useEffect(() => {
    if (state.phase === "processing" || state.phase === "reviewing") {
      void savePersistedImportSessionState(state);
      return;
    }

    if (state.phase === "idle" && state.songs.length === 0) {
      void clearPersistedImportSessionState();
    }
  }, [state]);
}
