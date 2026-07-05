import type { ImportSessionState } from "../types/import-session";
import { getImportFilesHref } from "./import-navigation-service";
import { getImportFailureState } from "./import-result-state-service";
import type { ImportResultViewState } from "./import-result-view-state-types";

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
