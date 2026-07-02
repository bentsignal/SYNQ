import { StyleSheet, Text, View } from "react-native";
import { formatDurationMs } from "@/src/features/app-shell/services/duration-format-service";
import { useCustomizationTheme } from "@/src/features/settings/hooks/use-customization-theme";
import type {
  PlaybackQueueItem,
  PlaybackState,
} from "../types/playback-state";

type PlaybackNowPlayingPanelProps = {
  activeTrack: PlaybackQueueItem | null;
  progressPercent: number;
  state: PlaybackState;
};

export function PlaybackNowPlayingPanel({
  activeTrack,
  progressPercent,
  state,
}: PlaybackNowPlayingPanelProps) {
  const theme = useCustomizationTheme();

  return (
    <View
      style={[
        styles.nowPlayingPanel,
        { backgroundColor: theme.surface, borderColor: theme.border },
      ]}
    >
      <Text style={[styles.panelLabel, { color: theme.secondaryText }]}>
        Now playing
      </Text>
      {activeTrack ? (
        <>
          <Text
            numberOfLines={2}
            style={[styles.trackTitle, { color: theme.primaryText }]}
          >
            {activeTrack.title}
          </Text>
          <Text
            numberOfLines={1}
            style={[styles.trackMeta, { color: theme.secondaryText }]}
          >
            {activeTrack.artist} / {activeTrack.album}
          </Text>
          <Text style={[styles.duration, { color: theme.primaryText }]}>
            {formatDurationMs(state.position)} / {formatDurationMs(state.duration)}
          </Text>
          <View style={[styles.progressTrack, { backgroundColor: theme.border }]}>
            <View
              style={[
                styles.progressFill,
                { backgroundColor: theme.accent, width: `${progressPercent}%` },
              ]}
            />
          </View>
          <Text style={[styles.progressText, { color: theme.secondaryText }]}>
            {progressPercent}% complete
          </Text>
        </>
      ) : (
        <>
          <Text style={[styles.trackTitle, { color: theme.primaryText }]}>
            Nothing selected
          </Text>
          <Text style={[styles.trackMeta, { color: theme.secondaryText }]}>
            Open a song in Library and start a playback session.
          </Text>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  nowPlayingPanel: {
    borderRadius: 8,
    borderWidth: 1,
    gap: 8,
    minHeight: 180,
    padding: 18,
  },
  panelLabel: {
    fontSize: 12,
    fontWeight: "800",
    letterSpacing: 0,
    textTransform: "uppercase",
  },
  trackTitle: {
    fontSize: 28,
    fontWeight: "800",
    letterSpacing: 0,
    lineHeight: 34,
  },
  trackMeta: {
    fontSize: 15,
    lineHeight: 22,
  },
  duration: {
    fontSize: 18,
    fontWeight: "800",
    letterSpacing: 0,
    lineHeight: 24,
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
  progressText: {
    fontSize: 12,
    fontWeight: "800",
    letterSpacing: 0,
    lineHeight: 17,
    textTransform: "uppercase",
  },
});
