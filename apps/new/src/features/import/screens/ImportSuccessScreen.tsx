import { ImportResultScreenView } from "../components/ImportResultScreenView";
import { useImportSession } from "../hooks/use-import-session";
import { getImportSuccessState } from "../services/import-screen-state-service";

export function ImportSuccessScreen() {
  const { state } = useImportSession();
  const resultState = getImportSuccessState(state);

  return (
    <ImportResultScreenView
      backHref="/(tabs)/library"
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
