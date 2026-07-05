import type { ImportSessionState } from "../types/import-session";

export const getImportSuccessState = (state: ImportSessionState) => {
  const savedCount = state.saveSummary?.saved ?? 0;
  const discardedCount = state.saveSummary?.discarded ?? 0;

  return {
    librarySaveLabel: state.shouldSaveToLibrary
      ? `${savedCount} saved to library`
      : `${discardedCount} discarded`,
    processedLabel: `${state.progress.current} of ${state.progress.total} songs processed.`,
    showLibraryHint: savedCount > 0,
  };
};

export const getImportFailureState = (state: ImportSessionState) => ({
  errorLabel: state.error ?? "The import session could not continue.",
  phaseLabel: state.phase,
});
