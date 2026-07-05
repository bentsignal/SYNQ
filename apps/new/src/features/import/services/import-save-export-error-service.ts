export const getImportSaveExportErrorMessage = (caughtError: unknown) =>
  caughtError instanceof Error
    ? caughtError.message
    : "Staged songs could not be exported.";
