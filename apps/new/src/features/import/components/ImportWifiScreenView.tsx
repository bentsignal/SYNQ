import { ScrollView, StyleSheet } from "react-native";
import { useCustomizationTheme } from "@/src/features/settings/hooks/use-customization-theme";
import type { ImportWifiScreenController } from "../hooks/use-import-wifi-screen-controller";
import { ImportSongPreviewList } from "./ImportSongPreviewList";
import { ImportWifiActions } from "./ImportWifiActions";
import { ImportWifiAddressPanel } from "./ImportWifiAddressPanel";
import { ImportWifiHeader } from "./ImportWifiHeader";
import { ImportWifiProgressPanel } from "./ImportWifiProgressPanel";

type ImportWifiScreenViewProps = ImportWifiScreenController;

export function ImportWifiScreenView({
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
      contentContainerStyle={styles.content}
      style={[styles.scroll, { backgroundColor: theme.background }]}
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
        canReviewSave={canReviewSave}
        reviewSave={reviewSave}
      />
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
});
