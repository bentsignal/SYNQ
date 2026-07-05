import { Link } from "expo-router";
import { ScrollView } from "react-native";
import { useCustomizationTheme } from "@/src/features/settings/hooks/use-customization-theme";
import type { ImportSaveController } from "../hooks/use-import-save-controller";
import { getImportSongPreviewListState } from "../services/import-song-preview-state-service";
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
  removeSong,
  state,
  toggleShouldSaveToLibrary,
  viewState,
}: ImportSaveScreenViewProps) {
  const theme = useCustomizationTheme();
  const songPreviewListState = getImportSongPreviewListState({
    songs: state.songs,
  });

  return (
    <ScrollView
      className="flex-1"
      contentContainerClassName="gap-5 px-5 py-14"
      style={{ backgroundColor: theme.background }}
    >
      <ImportSaveHeader headerState={viewState.headerState} />

      <ImportPremiumGate>
        <ImportSaveLibraryToggle
          shouldSaveToLibrary={state.shouldSaveToLibrary}
          toggleShouldSaveToLibrary={toggleShouldSaveToLibrary}
          toggleState={viewState.libraryToggleState}
        />
        <ImportSongPreviewList
          canEditSongs
          emptyState={viewState.songPreviewEmptyState}
          onRemoveSong={actionState.canRemoveSongs ? removeSong : undefined}
          rows={songPreviewListState.rows}
        />
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
        href={viewState.backLink.href}
        style={{ color: theme.accent }}
      >
        {viewState.backLink.label}
      </Link>
    </ScrollView>
  );
}
