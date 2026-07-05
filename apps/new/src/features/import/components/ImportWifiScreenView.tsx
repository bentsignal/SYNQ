import { ScrollView } from "react-native";
import { useCustomizationTheme } from "@/src/features/settings/hooks/use-customization-theme";
import type { ImportWifiScreenController } from "../hooks/use-import-wifi-screen-controller";
import { getImportSongPreviewListState } from "../services/import-song-preview-state-service";
import { ImportSongPreviewList } from "./ImportSongPreviewList";
import { ImportWifiActions } from "./ImportWifiActions";
import { ImportWifiAddressPanel } from "./ImportWifiAddressPanel";
import { ImportWifiHeader } from "./ImportWifiHeader";
import { ImportWifiProgressPanel } from "./ImportWifiProgressPanel";

type ImportWifiScreenViewProps = ImportWifiScreenController;

export function ImportWifiScreenView({
  actionState,
  removeSong,
  reviewSave,
  serverState,
  songPreviewEmptyState,
  state,
  wifiState,
}: ImportWifiScreenViewProps) {
  const theme = useCustomizationTheme();
  const { canReviewSave, progressLabel, statusLabel } = wifiState;
  const songPreviewListState = getImportSongPreviewListState({
    songs: state.songs,
  });

  return (
    <ScrollView
      className="flex-1"
      contentContainerClassName="gap-5 px-5 py-14"
      style={{ backgroundColor: theme.background }}
    >
      <ImportWifiHeader />
      <ImportWifiAddressPanel
        serverState={serverState}
        statusLabel={statusLabel}
      />
      <ImportWifiProgressPanel progressLabel={progressLabel} />
      <ImportSongPreviewList
        canEditSongs
        emptyState={songPreviewEmptyState}
        onRemoveSong={removeSong}
        rows={songPreviewListState.rows}
      />
      <ImportWifiActions
        actionState={actionState}
        canReviewSave={canReviewSave}
        reviewSave={reviewSave}
      />
    </ScrollView>
  );
}
