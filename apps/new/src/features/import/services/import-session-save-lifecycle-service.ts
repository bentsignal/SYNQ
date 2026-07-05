import type { ImportSessionState } from "../types/import-session";
import { getPremiumScopedImportSongs } from "./import-premium-access-service";
import {
  getFailedImportSessionLifecycleResult,
  getFinishImportSessionAction,
  getSucceededImportSessionLifecycleResult,
  type ImportSessionLifecycleResult,
} from "./import-session-lifecycle-result-service";
import type { ImportSessionLifecycleDependencies } from "./import-session-lifecycle-service";

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
