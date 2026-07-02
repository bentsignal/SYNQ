import {
  createContext,
  useContext,
  useMemo,
  useReducer,
  type ReactNode,
} from "react";
import {
  useImportSessionCommands,
  type ImportSessionCommands,
} from "../hooks/use-import-session-commands";
import { usePersistedImportSession } from "../hooks/use-persisted-import-session";
import {
  importSessionReducer,
  initialImportSessionState,
} from "../services/import-session-state-service";
import type { ImportSessionState } from "../types/import-session";

type ImportSessionValue = ImportSessionCommands & {
  state: ImportSessionState;
};

const ImportSessionContext = createContext<ImportSessionValue | null>(null);

export function ImportSessionProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(
    importSessionReducer,
    initialImportSessionState,
  );

  usePersistedImportSession({ dispatch, state });
  const commands = useImportSessionCommands({
    dispatch,
    state,
  });

  const value = useMemo<ImportSessionValue>(
    () => ({
      ...commands,
      state,
    }),
    [commands, state],
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
