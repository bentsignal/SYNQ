import { Link } from "expo-router";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { formatDurationMs } from "@/src/features/app-shell/services/duration-format-service";
import { useCustomizationTheme } from "@/src/features/settings/hooks/use-customization-theme";
import { usePlaybackPlayerController } from "../hooks/use-playback-player-controller";

export function PlaybackPlayerScreen() {
  const theme = useCustomizationTheme();
  const {
    actionState,
    activeTrack,
    adProgressPercent,
    fastForward,
    freeListeningRemainingMs,
    progressPercent,
    rewind,
    skipBack,
    skipForward,
    state,
    toggleLoopMode,
    togglePlayPause,
    toggleShuffleMode,
  } = usePlaybackPlayerController();

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

      {actionState.adBreakActive ? (
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
          disabled={!actionState.canSkipPrevious}
          onPress={skipBack}
          style={[
            styles.controlButton,
            { backgroundColor: theme.surface, borderColor: theme.border },
            !actionState.canSkipPrevious ? styles.disabled : null,
          ]}
        >
          <Text style={[styles.controlText, { color: theme.primaryText }]}>
            Prev
          </Text>
        </Pressable>
        <Pressable
          accessibilityRole="button"
          disabled={!actionState.canPlayPause}
          onPress={togglePlayPause}
          style={[
            styles.primaryButton,
            { backgroundColor: theme.accent },
            !actionState.canPlayPause ? styles.disabled : null,
          ]}
        >
          <Text style={[styles.primaryText, { color: theme.onAccent }]}>
            {actionState.playPauseLabel}
          </Text>
        </Pressable>
        <Pressable
          accessibilityRole="button"
          disabled={!actionState.canSkipNext}
          onPress={skipForward}
          style={[
            styles.controlButton,
            { backgroundColor: theme.surface, borderColor: theme.border },
            !actionState.canSkipNext ? styles.disabled : null,
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
          disabled={!actionState.canRewind}
          onPress={rewind}
          style={[
            styles.controlButton,
            { backgroundColor: theme.surface, borderColor: theme.border },
            !actionState.canRewind ? styles.disabled : null,
          ]}
        >
          <Text style={[styles.controlText, { color: theme.primaryText }]}>
            -15s
          </Text>
        </Pressable>
        <Pressable
          accessibilityRole="button"
          disabled={!actionState.canFastForward}
          onPress={fastForward}
          style={[
            styles.controlButton,
            { backgroundColor: theme.surface, borderColor: theme.border },
            !actionState.canFastForward ? styles.disabled : null,
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
          onPress={toggleShuffleMode}
          style={[
            styles.controlButton,
            { backgroundColor: theme.surface, borderColor: theme.border },
          ]}
        >
          <Text style={[styles.controlText, { color: theme.primaryText }]}>
            {actionState.shuffleLabel}
          </Text>
        </Pressable>
        <Pressable
          accessibilityRole="button"
          onPress={toggleLoopMode}
          style={[
            styles.controlButton,
            { backgroundColor: theme.surface, borderColor: theme.border },
          ]}
        >
          <Text style={[styles.controlText, { color: theme.primaryText }]}>
            {actionState.loopLabel}
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
