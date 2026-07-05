import { useMemo } from "react";
import {
  createImportSessionLifecycleCommands,
} from "../services/import-session-lifecycle-command-service";
import { importSessionLifecycleDependencies } from "../services/import-session-lifecycle-dependencies-service";
import type { ImportSessionAction } from "../services/import-session-state-service";
import type { ImportSessionState } from "../types/import-session";

type UseImportSessionLifecycleCommandsParams = {
  dispatch: (action: ImportSessionAction) => void;
  premiumActive: boolean;
  shouldSaveToLibrary: boolean;
  songs: ImportSessionState["songs"];
};

export function useImportSessionLifecycleCommands({
  dispatch,
  premiumActive,
  shouldSaveToLibrary,
  songs,
}: UseImportSessionLifecycleCommandsParams) {
  return useMemo(
    () =>
      createImportSessionLifecycleCommands({
        dependencies: importSessionLifecycleDependencies,
        dispatch,
        premiumActive,
        shouldSaveToLibrary,
        songs,
      }),
    [dispatch, premiumActive, shouldSaveToLibrary, songs],
  );
}
