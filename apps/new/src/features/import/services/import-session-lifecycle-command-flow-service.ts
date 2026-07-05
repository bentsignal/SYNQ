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
import {
  getSavingImportSessionAction,
  type ImportSessionAction,
} from "./import-session-action-service";

type ImportSessionLifecycleDispatch = (action: ImportSessionAction) => void;

type ImportSessionLifecycleCommandResult = {
  action: ImportSessionAction;
  succeeded: boolean;
};

const runImportSessionLifecycleAttempt = async ({
  dispatch,
  run,
}: {
  dispatch: ImportSessionLifecycleDispatch;
  run: () => Promise<ImportSessionLifecycleCommandResult>;
}) => {
  dispatch(getSavingImportSessionAction());

  const result = await run();
  dispatch(result.action);
  return result.succeeded;
};

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
