export const getImportFileCacheErrorMessage = (error: unknown) =>
  error instanceof Error ? error.message : String(error);

