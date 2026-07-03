import type { ImportSessionAction } from "./import-session-state-service";
import type { ImportSessionState } from "../types/import-session";

type ImportSessionHydrateAction = Extract<
  ImportSessionAction,
  { type: "hydrate" }
>;
type ImportSessionPersistenceDispatch = (
  action: ImportSessionHydrateAction,
) => void;

export const runImportSessionHydrateCommand = async ({
  dispatch,
  isCurrent,
  loadPersistedImportSessionState,
}: {
  dispatch: ImportSessionPersistenceDispatch;
  isCurrent: () => boolean;
  loadPersistedImportSessionState: () => Promise<ImportSessionState | null>;
}) => {
  const persistedState = await loadPersistedImportSessionState();

  if (isCurrent() && persistedState) {
    dispatch({ state: persistedState, type: "hydrate" });
  }
};

export const runImportSessionPersistenceCommand = async ({
  clearPersistedImportSessionState,
  savePersistedImportSessionState,
  state,
}: {
  clearPersistedImportSessionState: () => Promise<void>;
  savePersistedImportSessionState: (state: ImportSessionState) => Promise<void>;
  state: ImportSessionState;
}) => {
  if (state.phase === "processing" || state.phase === "reviewing") {
    await savePersistedImportSessionState(state);
    return;
  }

  if (state.phase === "idle" && state.songs.length === 0) {
    await clearPersistedImportSessionState();
  }
};
