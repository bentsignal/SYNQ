import type {
  BackupCommandResult,
  BackupOperation,
} from "../types/backup-session";
import {
  getBackupSessionErrorMessage,
  type BackupSessionAction,
} from "./backup-session-state-service";

type BackupSessionCommandDispatch = (action: BackupSessionAction) => void;

export const runBackupSessionOperationCommand = async ({
  dispatch,
  operation,
  runBackupCommand,
}: {
  dispatch: BackupSessionCommandDispatch;
  operation: BackupOperation;
  runBackupCommand: (operation: BackupOperation) => Promise<BackupCommandResult>;
}) => {
  dispatch({ operation, type: "start" });

  try {
    const result = await runBackupCommand(operation);
    dispatch({ result, type: "succeed" });
  } catch (caughtError) {
    dispatch({
      error: getBackupSessionErrorMessage(caughtError),
      operation,
      type: "fail",
    });
  }
};

export const runBackupSessionResetCommand = ({
  dispatch,
}: {
  dispatch: BackupSessionCommandDispatch;
}) => {
  dispatch({ type: "reset" });
};
