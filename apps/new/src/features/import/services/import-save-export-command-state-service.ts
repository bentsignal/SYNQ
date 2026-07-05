import type { HapticFeedbackType } from "../../settings/services/haptic-feedback-service";
import type { ImportSaveExportAction } from "./import-save-export-state-service";

export const getImportSaveExportErrorMessage = (caughtError: unknown) =>
  caughtError instanceof Error
    ? caughtError.message
    : "Staged songs could not be exported.";

export type ImportSaveExportResultCommand = {
  action?: ImportSaveExportAction;
  haptic: HapticFeedbackType;
};

export const getImportSaveExportSuccessCommand =
  (): ImportSaveExportResultCommand => ({
    haptic: "success",
  });

export const getImportSaveExportFailureCommand = (
  caughtError: unknown,
): ImportSaveExportResultCommand => ({
  action: {
    error: getImportSaveExportErrorMessage(caughtError),
    type: "fail",
  },
  haptic: "error",
});
