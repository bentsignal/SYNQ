import { Link } from "expo-router";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { usePlaybackSession } from "../hooks/use-playback-session";

const formatDuration = (duration: number) => {
  if (!duration) {
    return "--:--";
  }

  const totalSeconds = Math.round(duration / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;

  return `${minutes}:${seconds.toString().padStart(2, "0")}`;
};

export function PlaybackPlayerScreen() {
  const {
    activeTrack,
    pause,
    resume,
    skipNext,
    skipPrevious,
    state,
    toggleLoop,
    toggleShuffle,
  } = usePlaybackSession();

  return (
    <ScrollView contentContainerStyle={styles.content} style={styles.scroll}>
      <View style={styles.header}>
        <Text style={styles.kicker}>src/features/playback</Text>
        <Text style={styles.title}>Player</Text>
        <Text style={styles.subtitle}>
          Explicit playback session state is now available to the rewrite app.
        </Text>
      </View>

      <View style={styles.nowPlayingPanel}>
        <Text style={styles.panelLabel}>Now playing</Text>
        {activeTrack ? (
          <>
            <Text numberOfLines={2} style={styles.trackTitle}>
              {activeTrack.title}
            </Text>
            <Text numberOfLines={1} style={styles.trackMeta}>
              {activeTrack.artist} / {activeTrack.album}
            </Text>
            <Text style={styles.duration}>{formatDuration(state.duration)}</Text>
          </>
        ) : (
          <>
            <Text style={styles.trackTitle}>Nothing selected</Text>
            <Text style={styles.trackMeta}>
              Open a song in Library and start a playback session.
            </Text>
          </>
        )}
      </View>

      <View style={styles.controls}>
        <Pressable
          accessibilityRole="button"
          disabled={!activeTrack}
          onPress={skipPrevious}
          style={[styles.controlButton, !activeTrack ? styles.disabled : null]}
        >
          <Text style={styles.controlText}>Prev</Text>
        </Pressable>
        <Pressable
          accessibilityRole="button"
          disabled={!activeTrack}
          onPress={state.isPlaying ? pause : resume}
          style={[styles.primaryButton, !activeTrack ? styles.disabled : null]}
        >
          <Text style={styles.primaryText}>
            {state.isPlaying ? "Pause" : "Play"}
          </Text>
        </Pressable>
        <Pressable
          accessibilityRole="button"
          disabled={!activeTrack}
          onPress={skipNext}
          style={[styles.controlButton, !activeTrack ? styles.disabled : null]}
        >
          <Text style={styles.controlText}>Next</Text>
        </Pressable>
      </View>

      <View style={styles.controls}>
        <Pressable
          accessibilityRole="button"
          onPress={toggleShuffle}
          style={styles.controlButton}
        >
          <Text style={styles.controlText}>
            Shuffle {state.mode.shuffle ? "On" : "Off"}
          </Text>
        </Pressable>
        <Pressable
          accessibilityRole="button"
          onPress={toggleLoop}
          style={styles.controlButton}
        >
          <Text style={styles.controlText}>
            Loop {state.mode.loop ? "On" : "Off"}
          </Text>
        </Pressable>
      </View>

      <View style={styles.panel}>
        <Text style={styles.panelLabel}>Session</Text>
        <Text style={styles.panelText}>
          {state.queue.length} queued / revision {state.queueRevision}
        </Text>
      </View>

      <Link href="/queue" style={styles.backLink}>
        Open queue
      </Link>
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
  nowPlayingPanel: {
    backgroundColor: "#ffffff",
    borderColor: "#dbe3de",
    borderRadius: 8,
    borderWidth: 1,
    gap: 8,
    minHeight: 180,
    padding: 18,
  },
  panelLabel: {
    color: "#52605a",
    fontSize: 12,
    fontWeight: "800",
    letterSpacing: 0,
    textTransform: "uppercase",
  },
  trackTitle: {
    color: "#121417",
    fontSize: 28,
    fontWeight: "800",
    letterSpacing: 0,
    lineHeight: 34,
  },
  trackMeta: {
    color: "#52605a",
    fontSize: 15,
    lineHeight: 22,
  },
  duration: {
    color: "#29322e",
    fontSize: 18,
    fontWeight: "800",
    letterSpacing: 0,
    lineHeight: 24,
  },
  controls: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  controlButton: {
    alignItems: "center",
    backgroundColor: "#ffffff",
    borderColor: "#dbe3de",
    borderRadius: 8,
    borderWidth: 1,
    flexGrow: 1,
    justifyContent: "center",
    minHeight: 46,
    minWidth: 96,
    paddingHorizontal: 14,
  },
  primaryButton: {
    alignItems: "center",
    backgroundColor: "#0f766e",
    borderRadius: 8,
    flexGrow: 1,
    justifyContent: "center",
    minHeight: 46,
    minWidth: 110,
    paddingHorizontal: 14,
  },
  disabled: {
    opacity: 0.45,
  },
  controlText: {
    color: "#29322e",
    fontSize: 13,
    fontWeight: "800",
    letterSpacing: 0,
    textTransform: "uppercase",
  },
  primaryText: {
    color: "#ffffff",
    fontSize: 13,
    fontWeight: "800",
    letterSpacing: 0,
    textTransform: "uppercase",
  },
  panel: {
    backgroundColor: "#ffffff",
    borderColor: "#dbe3de",
    borderRadius: 8,
    borderWidth: 1,
    gap: 8,
    padding: 16,
  },
  panelText: {
    color: "#52605a",
    fontSize: 14,
    lineHeight: 20,
  },
  backLink: {
    color: "#0f766e",
    fontSize: 15,
    fontWeight: "800",
    letterSpacing: 0,
  },
});
