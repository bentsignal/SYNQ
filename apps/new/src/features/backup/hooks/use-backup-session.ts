import { useCallback, useMemo, useReducer } from "react";
import { runBackupCommand } from "../services/backup-command-service";
import {
  backupSessionReducer,
  getBackupSessionErrorMessage,
  initialBackupSessionState,
} from "../services/backup-session-state-service";
import type { BackupOperation } from "../types/backup-session";

export function useBackupSession() {
  const [state, dispatch] = useReducer(
    backupSessionReducer,
    initialBackupSessionState,
  );

  const runOperation = useCallback(async (operation: BackupOperation) => {
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
  }, []);

  const reset = useCallback(() => {
    dispatch({ type: "reset" });
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
