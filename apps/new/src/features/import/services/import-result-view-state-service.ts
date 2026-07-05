import type { ImportSessionState } from "../types/import-session";
import {
  getImportFilesHref,
  getImportLibraryHref,
  type ImportNavigationHref,
} from "./import-navigation-service";
import {
  getImportFailureState,
  getImportSuccessState,
} from "./import-result-state-service";

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
