import { StyleSheet, Text, View } from "react-native";
import { formatDurationMs } from "@/src/features/app-shell/services/duration-format-service";
import { useCustomizationTheme } from "@/src/features/settings/hooks/use-customization-theme";
import type { PlaybackState } from "../types/playback-state";

type PlaybackSessionPanelProps = {
  freeListeningRemainingMs: number;
  state: PlaybackState;
};

export function PlaybackSessionPanel({
  freeListeningRemainingMs,
  state,
}: PlaybackSessionPanelProps) {
  const theme = useCustomizationTheme();

  return (
    <View
      style={[
        styles.panel,
        { backgroundColor: theme.surface, borderColor: theme.border },
      ]}
    >
      <Text style={[styles.panelLabel, { color: theme.secondaryText }]}>
        Session
      </Text>
      <Text style={[styles.panelText, { color: theme.secondaryText }]}>
        {state.queue.length} queued
      </Text>
      <Text style={[styles.panelText, { color: theme.secondaryText }]}>
        Free listening before ad break:{" "}
        {formatDurationMs(freeListeningRemainingMs)}
      </Text>
    </View>
  );
}

export function PlaybackErrorPanel({ error }: { error: string }) {
  const theme = useCustomizationTheme();

  return (
    <View
      style={[
        styles.panel,
        { backgroundColor: theme.surface, borderColor: theme.border },
      ]}
    >
      <Text style={[styles.panelLabel, { color: theme.secondaryText }]}>
        Playback Error
      </Text>
      <Text style={[styles.errorText, { color: theme.danger }]}>{error}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  panel: {
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
  panelText: {
    fontSize: 14,
    lineHeight: 20,
  },
  errorText: {
    fontSize: 14,
    fontWeight: "700",
    lineHeight: 20,
  },
});
