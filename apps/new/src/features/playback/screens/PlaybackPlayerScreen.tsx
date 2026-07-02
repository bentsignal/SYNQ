import { Link } from "expo-router";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { formatDurationMs } from "@/src/features/app-shell/services/duration-format-service";
import { useCustomizationTheme } from "@/src/features/settings/hooks/use-customization-theme";
import { useHapticFeedback } from "@/src/features/settings/hooks/use-haptic-feedback";
import { usePlaybackSession } from "../hooks/use-playback-session";

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
  const theme = useCustomizationTheme();
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
    <ScrollView
      contentContainerStyle={styles.content}
      style={[styles.scroll, { backgroundColor: theme.background }]}
    >
      <View style={styles.header}>
        <Text style={[styles.kicker, { color: theme.accent }]}>
          Now Playing
        </Text>
        <Text style={[styles.title, { color: theme.primaryText }]}>
          Player
        </Text>
        <Text style={[styles.subtitle, { color: theme.secondaryText }]}>
          Control playback, queue movement, shuffle, repeat, and free-listening
          ad breaks.
        </Text>
      </View>

      {adBreakActive ? (
        <View style={styles.adPanel}>
          <Text style={styles.panelLabel}>Premium gate</Text>
          <Text style={styles.adTitle}>Ad break required</Text>
          <Text style={[styles.panelText, { color: theme.secondaryText }]}>
            Free playback pauses after 10 minutes of listening. The ad will
            resume your song when it finishes, or you can open Premium for
            ad-free listening.
          </Text>
          <Text style={[styles.panelText, { color: theme.secondaryText }]}>
            {formatDurationMs(state.adGate.playbackPosition)} /{" "}
            {formatDurationMs(state.adGate.playbackDuration)}
          </Text>
          <View style={[styles.progressTrack, { backgroundColor: theme.border }]}>
            <View
              style={[
                styles.progressFill,
                { backgroundColor: theme.accent, width: `${adProgressPercent}%` },
              ]}
            />
          </View>
          <View style={styles.adActions}>
            <Link asChild href="/premium">
              <Pressable
                accessibilityRole="button"
                style={[
                  styles.controlButton,
                  { backgroundColor: theme.surface, borderColor: theme.border },
                ]}
              >
                <Text style={[styles.controlText, { color: theme.primaryText }]}>
                  Open Premium
                </Text>
              </Pressable>
            </Link>
          </View>
        </View>
      ) : null}

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

      <View style={styles.controls}>
        <Pressable
          accessibilityRole="button"
          disabled={!hasActiveTrack || adBreakActive}
          onPress={handleSkipPrevious}
          style={[
            styles.controlButton,
            { backgroundColor: theme.surface, borderColor: theme.border },
            !hasActiveTrack || adBreakActive ? styles.disabled : null,
          ]}
        >
          <Text style={[styles.controlText, { color: theme.primaryText }]}>
            Prev
          </Text>
        </Pressable>
        <Pressable
          accessibilityRole="button"
          disabled={!hasActiveTrack || adBreakActive}
          onPress={handlePlayPause}
          style={[
            styles.primaryButton,
            { backgroundColor: theme.accent },
            !hasActiveTrack || adBreakActive ? styles.disabled : null,
          ]}
        >
          <Text style={[styles.primaryText, { color: theme.onAccent }]}>
            {state.isPlaying ? "Pause" : "Play"}
          </Text>
        </Pressable>
        <Pressable
          accessibilityRole="button"
          disabled={!hasActiveTrack || adBreakActive}
          onPress={handleSkipNext}
          style={[
            styles.controlButton,
            { backgroundColor: theme.surface, borderColor: theme.border },
            !hasActiveTrack || adBreakActive ? styles.disabled : null,
          ]}
        >
          <Text style={[styles.controlText, { color: theme.primaryText }]}>
            Next
          </Text>
        </Pressable>
      </View>

      <View style={styles.controls}>
        <Pressable
          accessibilityRole="button"
          disabled={!hasActiveTrack || adBreakActive || state.position <= 0}
          onPress={rewind}
          style={[
            styles.controlButton,
            { backgroundColor: theme.surface, borderColor: theme.border },
            !hasActiveTrack || adBreakActive || state.position <= 0
              ? styles.disabled
              : null,
          ]}
        >
          <Text style={[styles.controlText, { color: theme.primaryText }]}>
            -15s
          </Text>
        </Pressable>
        <Pressable
          accessibilityRole="button"
          disabled={
            !hasActiveTrack || adBreakActive || state.position >= state.duration
          }
          onPress={fastForward}
          style={[
            styles.controlButton,
            { backgroundColor: theme.surface, borderColor: theme.border },
            !hasActiveTrack || adBreakActive || state.position >= state.duration
              ? styles.disabled
              : null,
          ]}
        >
          <Text style={[styles.controlText, { color: theme.primaryText }]}>
            +15s
          </Text>
        </Pressable>
      </View>

      <View style={styles.controls}>
        <Pressable
          accessibilityRole="button"
          onPress={handleToggleShuffle}
          style={[
            styles.controlButton,
            { backgroundColor: theme.surface, borderColor: theme.border },
          ]}
        >
          <Text style={[styles.controlText, { color: theme.primaryText }]}>
            Shuffle {state.mode.shuffle ? "On" : "Off"}
          </Text>
        </Pressable>
        <Pressable
          accessibilityRole="button"
          onPress={handleToggleLoop}
          style={[
            styles.controlButton,
            { backgroundColor: theme.surface, borderColor: theme.border },
          ]}
        >
          <Text style={[styles.controlText, { color: theme.primaryText }]}>
            Loop {state.mode.loop ? "On" : "Off"}
          </Text>
        </Pressable>
      </View>

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

      {state.error ? (
        <View
          style={[
            styles.panel,
            { backgroundColor: theme.surface, borderColor: theme.border },
          ]}
        >
          <Text style={[styles.panelLabel, { color: theme.secondaryText }]}>
            Playback Error
          </Text>
          <Text style={[styles.errorText, { color: theme.danger }]}>
            {state.error}
          </Text>
        </View>
      ) : null}

      <Link href="/queue" style={[styles.backLink, { color: theme.accent }]}>
        Open queue
      </Link>
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
  nowPlayingPanel: {
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
  controls: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
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
  primaryButton: {
    alignItems: "center",
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
    fontSize: 13,
    fontWeight: "800",
    letterSpacing: 0,
    textTransform: "uppercase",
  },
  primaryText: {
    fontSize: 13,
    fontWeight: "800",
    letterSpacing: 0,
    textTransform: "uppercase",
  },
  panel: {
    borderRadius: 8,
    borderWidth: 1,
    gap: 8,
    padding: 16,
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
  backLink: {
    fontSize: 15,
    fontWeight: "800",
    letterSpacing: 0,
  },
});
