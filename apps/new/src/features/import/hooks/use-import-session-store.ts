import { useMemo, useReducer } from "react";
import { initialImportSessionState } from "../services/import-session-initial-state-service";
import {
  importSessionReducer,
} from "../services/import-session-state-service";
import type { ImportSessionState } from "../types/import-session";
import {
  useImportSessionCommands,
  type ImportSessionCommands,
} from "./use-import-session-commands";
import { usePersistedImportSession } from "./use-persisted-import-session";

export type ImportSessionValue = ImportSessionCommands & {
  state: ImportSessionState;
};

export function useImportSessionStore(): ImportSessionValue {
  const [state, dispatch] = useReducer(
    importSessionReducer,
    initialImportSessionState,
  );

  usePersistedImportSession({ dispatch, state });
  const commands = useImportSessionCommands({
    dispatch,
    state,
  });

  return useMemo<ImportSessionValue>(
    () => ({
      ...commands,
      state,
    }),
    [commands, state],
  );
}
