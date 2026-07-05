import type {
  BackupCommandResult,
  BackupOperation,
} from "../types/backup-session";
import {
  getBackupSessionFailAction,
  getBackupSessionErrorMessage,
  getBackupSessionResetAction,
  getBackupSessionStartAction,
  getBackupSessionSucceedAction,
  type BackupSessionAction,
} from "./backup-session-action-service";

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
  dispatch(getBackupSessionStartAction(operation));

  try {
    const result = await runBackupCommand(operation);
    dispatch(getBackupSessionSucceedAction(result));
  } catch (caughtError) {
    dispatch(getBackupSessionFailAction({
      error: getBackupSessionErrorMessage(caughtError),
      operation,
    }));
  }
};

export const runBackupSessionResetCommand = ({
  dispatch,
}: {
  dispatch: BackupSessionCommandDispatch;
}) => {
  dispatch(getBackupSessionResetAction());
};
