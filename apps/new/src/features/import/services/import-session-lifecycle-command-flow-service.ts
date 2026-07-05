import type {
  ImportSaveSummary,
  ImportSessionState,
} from "../types/import-session";
import {
  discardImportSessionLifecycle,
  getFinishImportSessionAction,
  resetImportSessionLifecycle,
  saveImportSessionLifecycle,
  type ImportSessionLifecycleDependencies,
} from "./import-session-lifecycle-service";
import type { ImportSessionAction } from "./import-session-action-service";
import { runImportSessionLifecycleAttempt } from "./import-session-lifecycle-command-runtime-service";

type ImportSessionLifecycleDispatch = (action: ImportSessionAction) => void;

export const runFinishImportSessionCommand = ({
  dispatch,
  summary,
}: {
  dispatch: ImportSessionLifecycleDispatch;
  summary: ImportSaveSummary;
}) => {
  dispatch(getFinishImportSessionAction(summary));
};

export const runSaveImportSessionCommand = async ({
  dependencies,
  dispatch,
  premiumActive,
  shouldSaveToLibrary,
  songs,
}: {
  dependencies: ImportSessionLifecycleDependencies;
  dispatch: ImportSessionLifecycleDispatch;
  premiumActive: boolean;
  shouldSaveToLibrary: boolean;
  songs: ImportSessionState["songs"];
}) => {
  return runImportSessionLifecycleAttempt({
    dispatch,
    run: () =>
      saveImportSessionLifecycle(
        {
          premiumActive,
          shouldSaveToLibrary,
          songs,
        },
        dependencies,
      ),
  });
};

export const runDiscardImportSessionCommand = async ({
  dependencies,
  dispatch,
}: {
  dependencies: ImportSessionLifecycleDependencies;
  dispatch: ImportSessionLifecycleDispatch;
}) => {
  return runImportSessionLifecycleAttempt({
    dispatch,
    run: () => discardImportSessionLifecycle(dependencies),
  });
};

export const runResetImportSessionCommand = ({
  dependencies,
  dispatch,
}: {
  dependencies: ImportSessionLifecycleDependencies;
  dispatch: ImportSessionLifecycleDispatch;
}) => {
  dispatch(resetImportSessionLifecycle(dependencies));
};
