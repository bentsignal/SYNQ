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
import type { ImportSessionAction } from "./import-session-state-service";

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
  shouldSaveToLibrary,
  songs,
}: {
  dependencies: ImportSessionLifecycleDependencies;
  dispatch: ImportSessionLifecycleDispatch;
  shouldSaveToLibrary: boolean;
  songs: ImportSessionState["songs"];
}) => {
  dispatch({ type: "saving" });

  const result = await saveImportSessionLifecycle(
    {
      shouldSaveToLibrary,
      songs,
    },
    dependencies,
  );
  dispatch(result.action);
  return result.succeeded;
};

export const runDiscardImportSessionCommand = async ({
  dependencies,
  dispatch,
}: {
  dependencies: ImportSessionLifecycleDependencies;
  dispatch: ImportSessionLifecycleDispatch;
}) => {
  dispatch({ type: "saving" });

  const result = await discardImportSessionLifecycle(dependencies);
  dispatch(result.action);
  return result.succeeded;
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
