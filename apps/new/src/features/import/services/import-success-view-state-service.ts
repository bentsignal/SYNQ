import type { ImportSessionState } from "../types/import-session";
import { getImportLibraryHref } from "./import-navigation-service";
import { getImportSuccessState } from "./import-result-state-service";
import type { ImportResultViewState } from "./import-result-view-state-types";

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

export type { ImportResultViewState } from "./import-result-view-state-types";
