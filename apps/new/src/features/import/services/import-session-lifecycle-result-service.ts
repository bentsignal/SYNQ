import type { ImportSessionAction } from "./import-session-action-service";
import { getImportSessionCommandErrorMessage } from "./import-session-command-error-service";
import type {
  ImportSaveSummary,
} from "../types/import-session";

type ImportSessionLifecycleMutation =
  | "discard-session"
  | "save-session";

export type ImportSessionLifecycleResult = {
  action: ImportSessionAction;
  succeeded: boolean;
};

export const getFinishImportSessionAction = (
  summary: ImportSaveSummary,
): ImportSessionAction => ({
  summary,
  type: "finish",
});

export const getSucceededImportSessionLifecycleResult = (
  action: ImportSessionAction,
): ImportSessionLifecycleResult => ({
  action,
  succeeded: true,
});

export const getFailedImportSessionLifecycleResult = ({
  caughtError,
  mutation,
}: {
  caughtError: unknown;
  mutation: ImportSessionLifecycleMutation;
}): ImportSessionLifecycleResult => ({
  action: {
    error: getImportSessionCommandErrorMessage({
      caughtError,
      mutation,
    }),
    type: "fail",
  },
  succeeded: false,
});
