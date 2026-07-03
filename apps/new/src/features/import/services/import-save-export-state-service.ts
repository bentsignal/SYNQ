import type { HapticFeedbackType } from "../../settings/services/haptic-feedback-service";

export type ImportSaveExportState = {
  error: string | null;
  isExporting: boolean;
};

export type ImportSaveExportAction =
  | {
      type: "begin";
    }
  | {
      type: "finish";
    }
  | {
      error: string;
      type: "fail";
    };

export const initialImportSaveExportState: ImportSaveExportState = {
  error: null,
  isExporting: false,
};

export const getImportSaveExportBeginAction =
  (): ImportSaveExportAction => ({
    type: "begin",
  });

export const getImportSaveExportFinishAction =
  (): ImportSaveExportAction => ({
    type: "finish",
  });

export const importSaveExportReducer = (
  state: ImportSaveExportState,
  action: ImportSaveExportAction,
): ImportSaveExportState => {
  switch (action.type) {
    case "begin":
      return {
        ...state,
        error: null,
        isExporting: true,
      };
    case "finish":
      return {
        ...state,
        isExporting: false,
      };
    case "fail":
      return {
        ...state,
        error: action.error,
      };
  }
};

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
