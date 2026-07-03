import { useCallback, useMemo, useReducer } from "react";
import { runBackupCommand } from "../services/backup-command-service";
import {
  runBackupSessionOperationCommand,
  runBackupSessionResetCommand,
} from "../services/backup-session-command-flow-service";
import {
  backupSessionReducer,
  initialBackupSessionState,
} from "../services/backup-session-state-service";
import type { BackupOperation } from "../types/backup-session";

export function useBackupSession() {
  const [state, dispatch] = useReducer(
    backupSessionReducer,
    initialBackupSessionState,
  );

  const runOperation = useCallback(async (operation: BackupOperation) => {
    await runBackupSessionOperationCommand({
      dispatch,
      operation,
      runBackupCommand,
    });
  }, []);

  const reset = useCallback(() => {
    runBackupSessionResetCommand({ dispatch });
  }, []);

  return useMemo(
    () => ({
      reset,
      runOperation,
      state,
    }),
    [reset, runOperation, state],
  );
}
