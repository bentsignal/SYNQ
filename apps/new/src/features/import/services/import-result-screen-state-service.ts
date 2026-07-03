import type { ImportSessionState } from "../types/import-session";
import {
  getImportFilesHref,
  getImportLibraryHref,
  type ImportNavigationHref,
} from "./import-navigation-service";

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

export type ImportResultViewState = {
  backHref: ImportNavigationHref;
  backLabel: string;
  kicker: string;
  panelHint?: string;
  panelLabel: string;
  panelText: string;
  subtitle: string;
  title: string;
  tone: "accent" | "danger";
};

export const getImportSuccessViewState = (
  state: ImportSessionState,
): ImportResultViewState => {
  const resultState = getImportSuccessState(state);

  return {
    backHref: getImportLibraryHref(),
    backLabel: "Open Library",
    kicker: "Import complete",
    panelHint: resultState.showLibraryHint
      ? "Saved songs are ready in Library."
      : undefined,
    panelLabel: "Library save",
    panelText: resultState.librarySaveLabel,
    subtitle: resultState.processedLabel,
    title: "Success",
    tone: "accent",
  };
};

export const getImportFailureViewState = (
  state: ImportSessionState,
): ImportResultViewState => {
  const resultState = getImportFailureState(state);

  return {
    backHref: getImportFilesHref(),
    backLabel: "Back to files",
    kicker: "Import stopped",
    panelLabel: "Phase",
    panelText: resultState.phaseLabel,
    subtitle: resultState.errorLabel,
    title: "Failure",
    tone: "danger",
  };
};
