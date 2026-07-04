import { ScrollView } from "react-native";
import { useCustomizationTheme } from "@/src/features/settings/hooks/use-customization-theme";
import type { ImportWifiScreenController } from "../hooks/use-import-wifi-screen-controller";
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
  state,
  wifiState,
}: ImportWifiScreenViewProps) {
  const theme = useCustomizationTheme();
  const { canReviewSave, progressLabel, statusLabel } = wifiState;

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
        onRemoveSong={removeSong}
        songs={state.songs}
      />
      <ImportWifiActions
        actionState={actionState}
        canReviewSave={canReviewSave}
        reviewSave={reviewSave}
      />
    </ScrollView>
  );
}
