import { Link } from "expo-router";
import { ScrollView, StyleSheet } from "react-native";
import { useCustomizationTheme } from "@/src/features/settings/hooks/use-customization-theme";
import type { ImportSaveController } from "../hooks/use-import-save-controller";
import { getImportSaveBackLink } from "../services/import-screen-state-service";
import type { ImportSessionState } from "../types/import-session";
import { ImportPremiumGate } from "./ImportPremiumGate";
import { ImportSaveActions } from "./ImportSaveActions";
import { ImportSaveExportErrorPanel } from "./ImportSaveExportErrorPanel";
import { ImportSaveHeader } from "./ImportSaveHeader";
import { ImportSaveLibraryToggle } from "./ImportSaveLibraryToggle";
import { ImportSongPreviewList } from "./ImportSongPreviewList";

type ImportSaveScreenViewProps = ImportSaveController & {
  state: ImportSessionState;
};

export function ImportSaveScreenView({
  actionState,
  discardImport,
  exportError,
  exportSongs,
  finishImport,
  state,
  toggleShouldSaveToLibrary,
}: ImportSaveScreenViewProps) {
  const theme = useCustomizationTheme();
  const backLink = getImportSaveBackLink();

  return (
    <ScrollView
      contentContainerStyle={styles.content}
      style={[styles.scroll, { backgroundColor: theme.background }]}
    >
      <ImportSaveHeader />

      <ImportPremiumGate>
        <ImportSaveLibraryToggle
          shouldSaveToLibrary={state.shouldSaveToLibrary}
          toggleShouldSaveToLibrary={toggleShouldSaveToLibrary}
        />
        <ImportSongPreviewList canEditSongs songs={state.songs} />
        <ImportSaveActions
          actionState={actionState}
          discardImport={discardImport}
          exportSongs={exportSongs}
          finishImport={finishImport}
        />
        <ImportSaveExportErrorPanel exportError={exportError} />
      </ImportPremiumGate>

      <Link
        href={backLink.href}
        style={[styles.backLink, { color: theme.accent }]}
      >
        {backLink.label}
      </Link>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: {
    flex: 1,
  },
  content: {
    gap: 20,
    paddingHorizontal: 20,
    paddingVertical: 56,
  },
  backLink: {
    fontSize: 15,
    fontWeight: "800",
    letterSpacing: 0,
  },
});
