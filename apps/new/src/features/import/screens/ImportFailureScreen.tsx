import { ImportResultScreenView } from "../components/ImportResultScreenView";
import { useImportSessionSelector } from "../hooks/use-import-session";
import { getImportFilesHref } from "../services/import-navigation-service";
import { getImportFailureState } from "../services/import-result-screen-state-service";

export function ImportFailureScreen() {
  const state = useImportSessionSelector((store) => store.state);
  const resultState = getImportFailureState(state);

  return (
    <ImportResultScreenView
      backHref={getImportFilesHref()}
      backLabel="Back to files"
      kicker="Import stopped"
      panelLabel="Phase"
      panelText={resultState.phaseLabel}
      subtitle={resultState.errorLabel}
      title="Failure"
      tone="danger"
    />
  );
}
