import { ScrollView } from "react-native";
import { useCustomizationTheme } from "@/src/features/settings/hooks/use-customization-theme";
import type { ImportFilesController } from "../hooks/use-import-files-controller";
import { ImportFilesActionLinks } from "./ImportFilesActionLinks";
import { ImportFilesChooseButton } from "./ImportFilesChooseButton";
import { ImportFilesHeader } from "./ImportFilesHeader";
import { ImportPremiumGate } from "./ImportPremiumGate";
import { ImportSongPreviewList } from "./ImportSongPreviewList";

type ImportFilesScreenViewProps = ImportFilesController;

export function ImportFilesScreenView({
  chooseFiles,
  removeSong,
  viewState,
}: ImportFilesScreenViewProps) {
  const theme = useCustomizationTheme();
  const { actionLinks, actionState, songPreviewEmptyState, songPreviewListState } =
    viewState;

  return (
    <ScrollView
      className="flex-1"
      contentContainerClassName="gap-5 px-5 py-14"
      style={{ backgroundColor: theme.background }}
    >
      <ImportFilesHeader
        accentColor={theme.accent}
        primaryTextColor={theme.primaryText}
        secondaryTextColor={theme.secondaryText}
      />

      <ImportPremiumGate>
        <ImportFilesChooseButton
          accentColor={theme.accent}
          actionState={actionState}
          onAccentColor={theme.onAccent}
          onChooseFiles={chooseFiles}
        />
      </ImportPremiumGate>

      <ImportSongPreviewList
        canEditSongs
        emptyState={songPreviewEmptyState}
        onRemoveSong={removeSong}
        rows={songPreviewListState.rows}
      />

      <ImportFilesActionLinks
        accentColor={theme.accent}
        links={actionLinks}
      />
    </ScrollView>
  );
}
