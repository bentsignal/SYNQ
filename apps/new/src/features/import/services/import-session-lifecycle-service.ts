import type {
  ImportSaveSummary,
  ImportSessionState,
} from "../types/import-session";
import type { ImportSessionAction } from "./import-session-action-service";
import { getPremiumScopedImportSongs } from "./import-premium-access-service";
import {
  getFailedImportSessionLifecycleResult,
  getFinishImportSessionAction,
  getSucceededImportSessionLifecycleResult,
  type ImportSessionLifecycleResult,
} from "./import-session-lifecycle-result-service";

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

export { getFinishImportSessionAction };

export const saveImportSessionLifecycle = async (
  {
    premiumActive,
    shouldSaveToLibrary,
    songs,
  }: {
    premiumActive: boolean;
    shouldSaveToLibrary: boolean;
    songs: ImportSessionState["songs"];
  },
  dependencies: ImportSessionLifecycleDependencies,
): Promise<ImportSessionLifecycleResult> => {
  try {
    const scopedSongs = getPremiumScopedImportSongs({
      premiumActive,
      songs,
    });
    const summary = shouldSaveToLibrary
      ? await dependencies.saveImportSessionToLibrary(scopedSongs)
      : await dependencies.discardImportSession(songs);

    await dependencies.clearPersistedImportSessionState();
    return getSucceededImportSessionLifecycleResult(
      getFinishImportSessionAction(summary),
    );
  } catch (caughtError) {
    return getFailedImportSessionLifecycleResult({
      caughtError,
      mutation: "save-session",
    });
  }
};

export const discardImportSessionLifecycle = async (
  dependencies: ImportSessionLifecycleDependencies,
): Promise<ImportSessionLifecycleResult> => {
  try {
    await dependencies.clearImportCache();
    await dependencies.clearPersistedImportSessionState();
    return getSucceededImportSessionLifecycleResult({ type: "discard" });
  } catch (caughtError) {
    return getFailedImportSessionLifecycleResult({
      caughtError,
      mutation: "discard-session",
    });
  }
};

export const resetImportSessionLifecycle = (
  dependencies: ImportSessionLifecycleDependencies,
): ImportSessionAction => {
  void dependencies.clearImportCache();
  void dependencies.clearPersistedImportSessionState();
  return { type: "reset" };
};
