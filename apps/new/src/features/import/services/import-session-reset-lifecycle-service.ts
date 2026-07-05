import type { ImportSessionAction } from "./import-session-action-service";
import type { ImportSessionLifecycleDependencies } from "./import-session-lifecycle-service";

export const resetImportSessionLifecycle = (
  dependencies: ImportSessionLifecycleDependencies,
): ImportSessionAction => {
  void dependencies.clearImportCache();
  void dependencies.clearPersistedImportSessionState();
  return { type: "reset" };
};
