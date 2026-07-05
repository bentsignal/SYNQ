export const getImportSongEditErrorMessage = (caughtError: unknown) =>
  caughtError instanceof Error
    ? caughtError.message
    : "Song could not be updated.";

export const getImportSongEditRequiredTitleMessage = () => "Title is required.";
