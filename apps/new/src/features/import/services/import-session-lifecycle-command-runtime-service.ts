import {
  getSavingImportSessionAction,
  type ImportSessionAction,
} from "./import-session-action-service";

type ImportSessionLifecycleDispatch = (action: ImportSessionAction) => void;

type ImportSessionLifecycleCommandResult = {
  action: ImportSessionAction;
  succeeded: boolean;
};

export const runImportSessionLifecycleAttempt = async ({
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
