import {
  getFailedImportSessionLifecycleResult,
  getSucceededImportSessionLifecycleResult,
  type ImportSessionLifecycleResult,
} from "./import-session-lifecycle-result-service";
import type { ImportSessionLifecycleDependencies } from "./import-session-lifecycle-service";

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
