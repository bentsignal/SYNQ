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
