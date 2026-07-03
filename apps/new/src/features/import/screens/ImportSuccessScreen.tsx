import { ImportResultScreenView } from "../components/ImportResultScreenView";
import { useImportSessionSelector } from "../hooks/use-import-session";
import { getImportLibraryHref } from "../services/import-navigation-service";
import { getImportSuccessState } from "../services/import-result-screen-state-service";

export function ImportSuccessScreen() {
  const state = useImportSessionSelector((store) => store.state);
  const resultState = getImportSuccessState(state);

  return (
    <ImportResultScreenView
      backHref={getImportLibraryHref()}
      backLabel="Open Library"
      kicker="Import complete"
      panelHint={
        resultState.showLibraryHint
          ? "Saved songs are ready in Library."
          : undefined
      }
      panelLabel="Library save"
      panelText={resultState.librarySaveLabel}
      subtitle={resultState.processedLabel}
      title="Success"
      tone="accent"
    />
  );
}
