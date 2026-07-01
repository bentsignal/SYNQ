import { Link } from "expo-router";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { ImportSongPreviewList } from "../components/ImportSongPreviewList";
import { useImportSession } from "../hooks/use-import-session";
import { useWifiImportServer } from "../hooks/use-wifi-import-server";

export function ImportWifiScreen() {
  const { removeImportSongs, state } = useImportSession();
  const { address, error, isReady } = useWifiImportServer();
  const hasSongs = state.songs.length > 0;
  const isTransferring = state.source === "wifi" && state.phase === "processing";
  const progressLabel =
    state.progress.total > 0
      ? `${state.progress.current}/${state.progress.total} received`
      : "Waiting";

  return (
    <ScrollView contentContainerStyle={styles.content} style={styles.scroll}>
      <View style={styles.header}>
        <Text style={styles.kicker}>Wi-Fi import</Text>
        <Text style={styles.title}>Transfer</Text>
        <Text style={styles.subtitle}>
          Open the local address from a browser on the same network and send
          audio files into this review session.
        </Text>
      </View>

      <View style={styles.addressPanel}>
        <Text style={styles.panelLabel}>Local address</Text>
        <Text
          selectable
          numberOfLines={2}
          style={address ? styles.addressText : styles.mutedText}
        >
          {address || "Finding device address"}
        </Text>
        <Text style={styles.statusText}>
          {error
            ? "Server failed"
            : isReady
              ? isTransferring
                ? "Receiving files"
                : "Server ready"
              : "Starting server"}
        </Text>
        {error ? <Text style={styles.errorText}>{error}</Text> : null}
      </View>

      <View style={styles.progressPanel}>
        <Text style={styles.panelLabel}>Progress</Text>
        <Text style={styles.progressValue}>{progressLabel}</Text>
      </View>

      <ImportSongPreviewList
        canEditSongs
        onRemoveSong={(songId) => removeImportSongs([songId])}
        songs={state.songs}
      />

      <View style={styles.actionRow}>
        <Link asChild href="/import/save">
          <Pressable
            accessibilityRole="button"
            disabled={!hasSongs}
            style={[styles.primaryButton, !hasSongs ? styles.disabled : null]}
          >
            <Text style={styles.primaryButtonText}>Review save</Text>
          </Pressable>
        </Link>
        <Link href="/import" style={styles.backLink}>
          Back to import
        </Link>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: {
    backgroundColor: "#f4f7f5",
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
    color: "#0f766e",
    fontSize: 13,
    fontWeight: "800",
    letterSpacing: 0,
    textTransform: "uppercase",
  },
  title: {
    color: "#121417",
    fontSize: 34,
    fontWeight: "800",
    letterSpacing: 0,
    lineHeight: 40,
  },
  subtitle: {
    color: "#52605a",
    fontSize: 15,
    lineHeight: 22,
    maxWidth: 520,
  },
  addressPanel: {
    backgroundColor: "#ffffff",
    borderColor: "#dbe3de",
    borderRadius: 8,
    borderWidth: 1,
    gap: 8,
    padding: 16,
  },
  panelLabel: {
    color: "#52605a",
    fontSize: 12,
    fontWeight: "800",
    letterSpacing: 0,
    textTransform: "uppercase",
  },
  addressText: {
    color: "#121417",
    fontSize: 21,
    fontWeight: "800",
    letterSpacing: 0,
    lineHeight: 28,
  },
  mutedText: {
    color: "#74807a",
    fontSize: 16,
    lineHeight: 22,
  },
  statusText: {
    color: "#0f766e",
    fontSize: 13,
    fontWeight: "800",
    letterSpacing: 0,
  },
  errorText: {
    color: "#b42318",
    fontSize: 13,
    fontWeight: "800",
    lineHeight: 18,
  },
  progressPanel: {
    alignItems: "center",
    backgroundColor: "#ffffff",
    borderColor: "#dbe3de",
    borderRadius: 8,
    borderWidth: 1,
    flexDirection: "row",
    gap: 12,
    justifyContent: "space-between",
    padding: 16,
  },
  progressValue: {
    color: "#121417",
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
    backgroundColor: "#0f766e",
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
    color: "#ffffff",
    fontSize: 13,
    fontWeight: "800",
    letterSpacing: 0,
    textTransform: "uppercase",
  },
  backLink: {
    color: "#0f766e",
    fontSize: 15,
    fontWeight: "800",
    letterSpacing: 0,
  },
});
