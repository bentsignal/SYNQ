import { getImportSessionCommandErrorMessage } from "./import-session-command-service";
import type { ImportSessionAction } from "./import-session-state-service";
import type {
  ImportSaveSummary,
  ImportSessionState,
} from "../types/import-session";

type ImportSessionLifecycleResult = {
  action: ImportSessionAction;
  succeeded: boolean;
};

export type ImportSessionLifecycleDependencies = {
  clearImportCache: () => Promise<void>;
  clearPersistedImportSessionState: () => Promise<void>;
  discardImportSession: (
    songs: ImportSessionState["songs"],
  ) => Promise<ImportSaveSummary>;
  saveImportSessionToLibrary: (
    songs: ImportSessionState["songs"],
  ) => Promise<ImportSaveSummary>;
};

export const getFinishImportSessionAction = (
  summary: ImportSaveSummary,
): ImportSessionAction => ({
  summary,
  type: "finish",
});

export const saveImportSessionLifecycle = async (
  {
    shouldSaveToLibrary,
    songs,
  }: {
    shouldSaveToLibrary: boolean;
    songs: ImportSessionState["songs"];
  },
  dependencies: ImportSessionLifecycleDependencies,
): Promise<ImportSessionLifecycleResult> => {
  try {
    const summary = shouldSaveToLibrary
      ? await dependencies.saveImportSessionToLibrary(songs)
      : await dependencies.discardImportSession(songs);

    await dependencies.clearPersistedImportSessionState();
    return {
      action: getFinishImportSessionAction(summary),
      succeeded: true,
    };
  } catch (caughtError) {
    return {
      action: {
        error: getImportSessionCommandErrorMessage({
          caughtError,
          mutation: "save-session",
        }),
        type: "fail",
      },
      succeeded: false,
    };
  }
};

export const discardImportSessionLifecycle = async (
  dependencies: ImportSessionLifecycleDependencies,
): Promise<ImportSessionLifecycleResult> => {
  try {
    await dependencies.clearImportCache();
    await dependencies.clearPersistedImportSessionState();
    return {
      action: { type: "discard" },
      succeeded: true,
    };
  } catch (caughtError) {
    return {
      action: {
        error: getImportSessionCommandErrorMessage({
          caughtError,
          mutation: "discard-session",
        }),
        type: "fail",
      },
      succeeded: false,
    };
  }
};

export const resetImportSessionLifecycle = (
  dependencies: ImportSessionLifecycleDependencies,
): ImportSessionAction => {
  void dependencies.clearImportCache();
  void dependencies.clearPersistedImportSessionState();
  return { type: "reset" };
};
