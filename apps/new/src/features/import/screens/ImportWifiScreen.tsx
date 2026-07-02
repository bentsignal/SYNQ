import { Link } from "expo-router";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { useCustomizationTheme } from "@/src/features/settings/hooks/use-customization-theme";
import { useHapticFeedback } from "@/src/features/settings/hooks/use-haptic-feedback";
import { ImportPremiumGate } from "../components/ImportPremiumGate";
import { ImportSongPreviewList } from "../components/ImportSongPreviewList";
import { useImportSession } from "../hooks/use-import-session";
import { useWifiImportServer } from "../hooks/use-wifi-import-server";

export function ImportWifiScreen() {
  return (
    <ImportPremiumGate>
      <ImportWifiContent />
    </ImportPremiumGate>
  );
}

function ImportWifiContent() {
  const { removeImportSongs, state } = useImportSession();
  const theme = useCustomizationTheme();
  const { sendHaptic } = useHapticFeedback();
  const { address, error, isReady, port } = useWifiImportServer();
  const hasSongs = state.songs.length > 0;
  const isTransferring = state.source === "wifi" && state.phase === "processing";
  const progressLabel =
    state.progress.total > 0
      ? `${state.progress.current}/${state.progress.total} received`
      : "Waiting";

  return (
    <ScrollView
      contentContainerStyle={styles.content}
      style={[styles.scroll, { backgroundColor: theme.background }]}
    >
      <View style={styles.header}>
        <Text style={[styles.kicker, { color: theme.accent }]}>
          Wi-Fi import
        </Text>
        <Text style={[styles.title, { color: theme.primaryText }]}>
          Transfer
        </Text>
        <Text style={[styles.subtitle, { color: theme.secondaryText }]}>
          Open the local address from a browser on the same network and send
          audio files into this review session.
        </Text>
      </View>

      <View
        style={[
          styles.addressPanel,
          { backgroundColor: theme.surface, borderColor: theme.border },
        ]}
      >
        <Text style={[styles.panelLabel, { color: theme.secondaryText }]}>
          Local address
        </Text>
        <Text
          selectable
          numberOfLines={2}
          style={[
            address ? styles.addressText : styles.mutedText,
            { color: address ? theme.primaryText : theme.mutedText },
          ]}
        >
          {address || "Finding device address"}
        </Text>
        <Text
          style={[styles.statusText, { color: error ? theme.danger : theme.accent }]}
        >
          {error
            ? "Server failed"
            : isReady
              ? isTransferring
                ? "Receiving files"
                : "Server ready"
              : "Starting server"}
        </Text>
        {port ? (
          <Text style={[styles.portText, { color: theme.secondaryText }]}>
            Listening on port {port}
          </Text>
        ) : null}
        {error ? (
          <Text style={[styles.errorText, { color: theme.danger }]}>
            {error}
          </Text>
        ) : null}
      </View>

      <View
        style={[
          styles.progressPanel,
          { backgroundColor: theme.surface, borderColor: theme.border },
        ]}
      >
        <Text style={[styles.panelLabel, { color: theme.secondaryText }]}>
          Progress
        </Text>
        <Text style={[styles.progressValue, { color: theme.primaryText }]}>
          {progressLabel}
        </Text>
      </View>

      <ImportSongPreviewList
        canEditSongs
        onRemoveSong={async (songId) => {
          sendHaptic("medium");
          const removed = await removeImportSongs([songId]);
          sendHaptic(removed ? "success" : "error");
        }}
        songs={state.songs}
      />

      <View style={styles.actionRow}>
        <Link asChild href="/(tabs)/import/save">
          <Pressable
            accessibilityRole="button"
            disabled={!hasSongs}
            onPress={() => sendHaptic("light")}
            style={[
              styles.primaryButton,
              { backgroundColor: theme.accent },
              !hasSongs ? styles.disabled : null,
            ]}
          >
            <Text style={[styles.primaryButtonText, { color: theme.onAccent }]}>
              Review save
            </Text>
          </Pressable>
        </Link>
        <Link href="/(tabs)/import" style={[styles.backLink, { color: theme.accent }]}>
          Back to import
        </Link>
      </View>
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
  header: {
    gap: 8,
  },
  kicker: {
    fontSize: 13,
    fontWeight: "800",
    letterSpacing: 0,
    textTransform: "uppercase",
  },
  title: {
    fontSize: 34,
    fontWeight: "800",
    letterSpacing: 0,
    lineHeight: 40,
  },
  subtitle: {
    fontSize: 15,
    lineHeight: 22,
    maxWidth: 520,
  },
  addressPanel: {
    borderRadius: 8,
    borderWidth: 1,
    gap: 8,
    padding: 16,
  },
  panelLabel: {
    fontSize: 12,
    fontWeight: "800",
    letterSpacing: 0,
    textTransform: "uppercase",
  },
  addressText: {
    fontSize: 21,
    fontWeight: "800",
    letterSpacing: 0,
    lineHeight: 28,
  },
  mutedText: {
    fontSize: 16,
    lineHeight: 22,
  },
  statusText: {
    fontSize: 13,
    fontWeight: "800",
    letterSpacing: 0,
  },
  errorText: {
    fontSize: 13,
    fontWeight: "800",
    lineHeight: 18,
  },
  portText: {
    fontSize: 12,
    lineHeight: 17,
  },
  progressPanel: {
    alignItems: "center",
    borderRadius: 8,
    borderWidth: 1,
    flexDirection: "row",
    gap: 12,
    justifyContent: "space-between",
    padding: 16,
  },
  progressValue: {
    fontSize: 16,
    fontWeight: "800",
    letterSpacing: 0,
  },
  actionRow: {
    alignItems: "center",
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 16,
  },
  primaryButton: {
    alignItems: "center",
    borderRadius: 8,
    justifyContent: "center",
    minHeight: 46,
    minWidth: 130,
    paddingHorizontal: 14,
  },
  disabled: {
    opacity: 0.45,
  },
  primaryButtonText: {
    fontSize: 13,
    fontWeight: "800",
    letterSpacing: 0,
    textTransform: "uppercase",
  },
  backLink: {
    fontSize: 15,
    fontWeight: "800",
    letterSpacing: 0,
  },
});
