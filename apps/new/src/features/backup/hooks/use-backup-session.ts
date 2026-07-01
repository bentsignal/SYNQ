import { useCallback, useMemo, useReducer } from "react";
import { runUnavailableBackupCommand } from "../services/backup-command-service";
import type {
  BackupCommandResult,
  BackupOperation,
  BackupSessionState,
} from "../types/backup-session";

type BackupSessionAction =
  | { operation: BackupOperation; type: "start" }
  | { result: BackupCommandResult; type: "succeed" }
  | { error: string; operation: BackupOperation; type: "fail" }
  | { type: "reset" };

const initialBackupSessionState: BackupSessionState = {
  error: null,
  lastOperation: null,
  phase: "idle",
  requiresPremium: true,
};

const backupSessionReducer = (
  state: BackupSessionState,
  action: BackupSessionAction,
): BackupSessionState => {
  switch (action.type) {
    case "start":
      return {
        ...state,
        error: null,
        lastOperation: action.operation,
        phase: "running",
      };
    case "succeed":
      return {
        ...state,
        error: null,
        lastOperation: action.result.operation,
        phase: "success",
      };
    case "fail":
      return {
        ...state,
        error: action.error,
        lastOperation: action.operation,
        phase: "failure",
      };
    case "reset":
      return initialBackupSessionState;
  }
};

export function useBackupSession() {
  const [state, dispatch] = useReducer(
    backupSessionReducer,
    initialBackupSessionState,
  );

  const runOperation = useCallback(async (operation: BackupOperation) => {
    dispatch({ operation, type: "start" });

    try {
      const result = await runUnavailableBackupCommand(operation);
      dispatch({ result, type: "succeed" });
    } catch (caughtError) {
      dispatch({
        error:
          caughtError instanceof Error
            ? caughtError.message
            : "Backup operation failed.",
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
