import { Link } from "expo-router";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { useHapticFeedback } from "@/src/features/settings/hooks/use-haptic-feedback";
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

const seekStep = 15_000;

const getProgressPercent = ({
  duration,
  position,
}: {
  duration: number;
  position: number;
}) => {
  if (!duration) {
    return 0;
  }

  return Math.round(Math.min(1, Math.max(0, position / duration)) * 100);
};

export function PlaybackPlayerScreen() {
  const { sendHaptic } = useHapticFeedback();
  const {
    activeTrack,
    pause,
    resume,
    seekTo,
    skipNext,
    skipPrevious,
    state,
    toggleLoop,
    toggleShuffle,
  } = usePlaybackSession();
  const hasActiveTrack = !!activeTrack;
  const adBreakActive = state.adGate.active || state.adGate.due;
  const adProgressPercent = getProgressPercent({
    duration: state.adGate.playbackDuration,
    position: state.adGate.playbackPosition,
  });
  const progressPercent = getProgressPercent({
    duration: state.duration,
    position: state.position,
  });
  const freeListeningRemainingMs = Math.max(
    0,
    state.adGate.thresholdMs - state.adGate.accumulatedMs,
  );
  const rewind = () => {
    sendHaptic("light");
    seekTo(Math.max(0, state.position - seekStep));
  };
  const fastForward = () => {
    sendHaptic("light");
    seekTo(Math.min(state.duration, state.position + seekStep));
  };
  const handleSkipPrevious = () => {
    sendHaptic("light");
    skipPrevious();
  };
  const handlePlayPause = () => {
    sendHaptic(state.isPlaying ? "soft" : "light");
    if (state.isPlaying) {
      pause();
      return;
    }

    resume();
  };
  const handleSkipNext = () => {
    sendHaptic("light");
    skipNext();
  };
  const handleToggleShuffle = () => {
    sendHaptic("light");
    toggleShuffle();
  };
  const handleToggleLoop = () => {
    sendHaptic("light");
    toggleLoop();
  };

  return (
    <ScrollView contentContainerStyle={styles.content} style={styles.scroll}>
      <View style={styles.header}>
        <Text style={styles.kicker}>src/features/playback</Text>
        <Text style={styles.title}>Player</Text>
        <Text style={styles.subtitle}>
          Explicit playback session state is now available to the rewrite app.
        </Text>
      </View>

      {adBreakActive ? (
        <View style={styles.adPanel}>
          <Text style={styles.panelLabel}>Premium gate</Text>
          <Text style={styles.adTitle}>Ad break required</Text>
          <Text style={styles.panelText}>
            Free playback pauses after 10 minutes of listening. The ad will
            resume your song when it finishes, or you can open Premium for
            ad-free listening.
          </Text>
          <Text style={styles.panelText}>
            {formatDuration(state.adGate.playbackPosition)} /{" "}
            {formatDuration(state.adGate.playbackDuration)}
          </Text>
          <View style={styles.progressTrack}>
            <View
              style={[styles.progressFill, { width: `${adProgressPercent}%` }]}
            />
          </View>
          <View style={styles.adActions}>
            <Link asChild href="/premium">
              <Pressable accessibilityRole="button" style={styles.controlButton}>
                <Text style={styles.controlText}>Open Premium</Text>
              </Pressable>
            </Link>
          </View>
        </View>
      ) : null}

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
            <Text style={styles.duration}>
              {formatDuration(state.position)} / {formatDuration(state.duration)}
            </Text>
            <View style={styles.progressTrack}>
              <View
                style={[styles.progressFill, { width: `${progressPercent}%` }]}
              />
            </View>
            <Text style={styles.progressText}>{progressPercent}% complete</Text>
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
          disabled={!hasActiveTrack || adBreakActive}
          onPress={handleSkipPrevious}
          style={[
            styles.controlButton,
            !hasActiveTrack || adBreakActive ? styles.disabled : null,
          ]}
        >
          <Text style={styles.controlText}>Prev</Text>
        </Pressable>
        <Pressable
          accessibilityRole="button"
          disabled={!hasActiveTrack || adBreakActive}
          onPress={handlePlayPause}
          style={[
            styles.primaryButton,
            !hasActiveTrack || adBreakActive ? styles.disabled : null,
          ]}
        >
          <Text style={styles.primaryText}>
            {state.isPlaying ? "Pause" : "Play"}
          </Text>
        </Pressable>
        <Pressable
          accessibilityRole="button"
          disabled={!hasActiveTrack || adBreakActive}
          onPress={handleSkipNext}
          style={[
            styles.controlButton,
            !hasActiveTrack || adBreakActive ? styles.disabled : null,
          ]}
        >
          <Text style={styles.controlText}>Next</Text>
        </Pressable>
      </View>

      <View style={styles.controls}>
        <Pressable
          accessibilityRole="button"
          disabled={!hasActiveTrack || adBreakActive || state.position <= 0}
          onPress={rewind}
          style={[
            styles.controlButton,
            !hasActiveTrack || adBreakActive || state.position <= 0
              ? styles.disabled
              : null,
          ]}
        >
          <Text style={styles.controlText}>-15s</Text>
        </Pressable>
        <Pressable
          accessibilityRole="button"
          disabled={
            !hasActiveTrack || adBreakActive || state.position >= state.duration
          }
          onPress={fastForward}
          style={[
            styles.controlButton,
            !hasActiveTrack || adBreakActive || state.position >= state.duration
              ? styles.disabled
              : null,
          ]}
        >
          <Text style={styles.controlText}>+15s</Text>
        </Pressable>
      </View>

      <View style={styles.controls}>
        <Pressable
          accessibilityRole="button"
          onPress={handleToggleShuffle}
          style={styles.controlButton}
        >
          <Text style={styles.controlText}>
            Shuffle {state.mode.shuffle ? "On" : "Off"}
          </Text>
        </Pressable>
        <Pressable
          accessibilityRole="button"
          onPress={handleToggleLoop}
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
        <Text style={styles.panelText}>
          Free listening before ad break:{" "}
          {formatDuration(freeListeningRemainingMs)}
        </Text>
      </View>

      {state.error ? (
        <View style={styles.panel}>
          <Text style={styles.panelLabel}>Playback Error</Text>
          <Text style={styles.errorText}>{state.error}</Text>
        </View>
      ) : null}

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
  progressTrack: {
    backgroundColor: "#dbe3de",
    borderRadius: 999,
    height: 8,
    overflow: "hidden",
  },
  progressFill: {
    backgroundColor: "#0f766e",
    borderRadius: 999,
    height: "100%",
  },
  progressText: {
    color: "#52605a",
    fontSize: 12,
    fontWeight: "800",
    letterSpacing: 0,
    lineHeight: 17,
    textTransform: "uppercase",
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
  errorText: {
    color: "#b42318",
    fontSize: 14,
    fontWeight: "700",
    lineHeight: 20,
  },
  backLink: {
    color: "#0f766e",
    fontSize: 15,
    fontWeight: "800",
    letterSpacing: 0,
  },
});
