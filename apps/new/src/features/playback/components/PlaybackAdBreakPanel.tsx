import { Link } from "expo-router";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { useCustomizationTheme } from "@/src/features/settings/hooks/use-customization-theme";
import { getPlaybackAdBreakPanelState } from "../services/playback-screen-state-service";
import type { PlaybackState } from "../types/playback-state";

type PlaybackAdBreakPanelProps = {
  progressPercent: number;
  state: PlaybackState;
};

export function PlaybackAdBreakPanel({
  progressPercent,
  state,
}: PlaybackAdBreakPanelProps) {
  const theme = useCustomizationTheme();
  const panelState = getPlaybackAdBreakPanelState({ state });

  return (
    <View style={styles.adPanel}>
      <Text style={styles.panelLabel}>{panelState.kicker}</Text>
      <Text style={styles.adTitle}>{panelState.title}</Text>
      <Text style={[styles.panelText, { color: theme.secondaryText }]}>
        {panelState.body}
      </Text>
      <Text style={[styles.panelText, { color: theme.secondaryText }]}>
        {panelState.progressLabel}
      </Text>
      <View style={[styles.progressTrack, { backgroundColor: theme.border }]}>
        <View
          style={[
            styles.progressFill,
            { backgroundColor: theme.accent, width: `${progressPercent}%` },
          ]}
        />
      </View>
      <View style={styles.adActions}>
        <Link asChild href={panelState.action.href}>
          <Pressable
            accessibilityRole="button"
            style={[
              styles.controlButton,
              { backgroundColor: theme.surface, borderColor: theme.border },
            ]}
          >
            <Text style={[styles.controlText, { color: theme.primaryText }]}>
              {panelState.action.label}
            </Text>
          </Pressable>
        </Link>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  adPanel: {
    backgroundColor: "#fff7ed",
    borderColor: "#fed7aa",
    borderRadius: 8,
    borderWidth: 1,
    gap: 10,
    padding: 16,
  },
  adTitle: {
    color: "#9a3412",
    fontSize: 20,
    fontWeight: "800",
    letterSpacing: 0,
    lineHeight: 26,
  },
  adActions: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
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
  progressTrack: {
    borderRadius: 999,
    height: 8,
    overflow: "hidden",
  },
  progressFill: {
    borderRadius: 999,
    height: "100%",
  },
  controlButton: {
    alignItems: "center",
    borderRadius: 8,
    borderWidth: 1,
    flexGrow: 1,
    justifyContent: "center",
    minHeight: 46,
    minWidth: 96,
    paddingHorizontal: 14,
  },
  controlText: {
    fontSize: 13,
    fontWeight: "800",
    letterSpacing: 0,
    textTransform: "uppercase",
  },
});
