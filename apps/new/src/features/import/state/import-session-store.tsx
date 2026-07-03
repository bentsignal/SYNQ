import {
  useMemo,
  useReducer,
  type ReactNode,
} from "react";
import { createStore } from "rostra";
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

export type ImportSessionValue = ImportSessionCommands & {
  state: ImportSessionState;
};

function useImportSessionStore(): ImportSessionValue {
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

const { Store, useStore } = createStore<object, ImportSessionValue>(
  useImportSessionStore,
);

export function ImportSessionProvider({ children }: { children: ReactNode }) {
  return <Store>{children}</Store>;
}

export function useImportSessionSelector<SelectedValue>(
  selector: (store: ImportSessionValue) => SelectedValue,
) {
  return useStore(selector);
}

export function useImportSession() {
  return useImportSessionSelector((store) => store);
}
