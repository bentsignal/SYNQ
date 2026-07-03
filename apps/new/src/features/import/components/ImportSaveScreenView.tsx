import { Link } from "expo-router";
import { ScrollView } from "react-native";
import { useCustomizationTheme } from "@/src/features/settings/hooks/use-customization-theme";
import type { ImportSaveController } from "../hooks/use-import-save-controller";
import { getImportSaveBackLink } from "../services/import-save-screen-state-service";
import { ImportPremiumGate } from "./ImportPremiumGate";
import { ImportSaveActions } from "./ImportSaveActions";
import { ImportSaveExportErrorPanel } from "./ImportSaveExportErrorPanel";
import { ImportSaveHeader } from "./ImportSaveHeader";
import { ImportSaveLibraryToggle } from "./ImportSaveLibraryToggle";
import { ImportSongPreviewList } from "./ImportSongPreviewList";

type ImportSaveScreenViewProps = ImportSaveController;

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
      className="flex-1"
      contentContainerClassName="gap-5 px-5 py-14"
      style={{ backgroundColor: theme.background }}
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
        className="text-[15px] font-extrabold"
        href={backLink.href}
        style={{ color: theme.accent }}
      >
        {backLink.label}
      </Link>
    </ScrollView>
  );
}
