import { Link } from "expo-router";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { formatDurationMs } from "@/src/features/app-shell/services/duration-format-service";
import { useCustomizationTheme } from "@/src/features/settings/hooks/use-customization-theme";
import { useHapticFeedback } from "@/src/features/settings/hooks/use-haptic-feedback";
import { usePlaybackSession } from "../hooks/use-playback-session";
import {
  getPlaybackQueueActionState,
  getPlaybackQueueRowState,
} from "../services/playback-session-service";

export function PlaybackQueueScreen() {
  const theme = useCustomizationTheme();
  const { sendHaptic } = useHapticFeedback();
  const {
    activeTrack,
    clearQueue,
    moveQueueSong,
    playSong,
    removeFromQueue,
    state,
  } = usePlaybackSession();
  const adBreakActive = state.adGate.active || state.adGate.due;
  const { canClearQueue } = getPlaybackQueueActionState({
    queueLength: state.queue.length,
  });
  const handlePlaySong = (song: Parameters<typeof playSong>[0]) => {
    sendHaptic("light");
    playSong(song);
  };
  const handleRemoveFromQueue = (songId: number) => {
    sendHaptic("medium");
    removeFromQueue(songId);
  };
  const handleMoveQueueSong = (songId: number, direction: "down" | "up") => {
    sendHaptic("light");
    moveQueueSong(songId, direction);
  };
  const handleClearQueue = () => {
    sendHaptic("medium");
    clearQueue();
  };

  return (
    <ScrollView
      contentContainerStyle={styles.content}
      style={[styles.scroll, { backgroundColor: theme.background }]}
    >
      <View style={styles.header}>
        <Text style={[styles.kicker, { color: theme.accent }]}>
          Playback queue
        </Text>
        <Text style={[styles.title, { color: theme.primaryText }]}>
          Now Playing
        </Text>
        <Text style={[styles.subtitle, { color: theme.secondaryText }]}>
          Reorder upcoming songs, remove tracks, or jump to a different song.
        </Text>
      </View>

      {adBreakActive ? (
        <View style={styles.adPanel}>
          <Text style={styles.panelLabel}>Premium gate</Text>
          <Text style={styles.adTitle}>Ad break required</Text>
          <Text style={[styles.panelText, { color: theme.secondaryText }]}>
            Queue playback commands are paused while the bundled ad plays. Your
            song resumes automatically when the ad finishes.
          </Text>
          <View style={styles.adActions}>
            <Link asChild href="/premium">
              <Pressable
                accessibilityRole="button"
                style={[
                  styles.premiumButton,
                  { backgroundColor: theme.surface },
                ]}
              >
                <Text style={styles.premiumText}>Open Premium</Text>
              </Pressable>
            </Link>
          </View>
        </View>
      ) : null}

      {state.queue.length === 0 ? (
        <View
          style={[
            styles.emptyPanel,
            { backgroundColor: theme.surface, borderColor: theme.border },
          ]}
        >
          <Text style={[styles.emptyTitle, { color: theme.primaryText }]}>
            Queue is empty
          </Text>
          <Text style={[styles.emptyBody, { color: theme.secondaryText }]}>
            Open a song from Library to start listening.
          </Text>
        </View>
      ) : (
        <View
          style={[
            styles.list,
            { backgroundColor: theme.surface, borderColor: theme.border },
          ]}
        >
          {state.queue.map((song, index) => {
            const { canMoveDown, canMoveUp, canPlay, isActive } =
              getPlaybackQueueRowState({
                activeTrackId: activeTrack?.id ?? null,
                adBreakActive,
                index,
                queueLength: state.queue.length,
                songId: song.id,
              });

            return (
              <View
                key={song.id}
                style={[styles.row, { borderBottomColor: theme.borderSubtle }]}
              >
                <Pressable
                  accessibilityRole="button"
                  disabled={!canPlay}
                  onPress={() => handlePlaySong(song)}
                  style={[styles.rowMain, !canPlay ? styles.disabled : null]}
                >
                  <Text
                    style={[
                      isActive ? styles.activeIndex : styles.index,
                      { color: isActive ? theme.accent : theme.mutedText },
                    ]}
                  >
                    {index + 1}
                  </Text>
                  <View style={styles.rowText}>
                    <Text
                      numberOfLines={1}
                      style={[styles.songTitle, { color: theme.primaryText }]}
                    >
                      {song.title}
                    </Text>
                    <Text
                      numberOfLines={1}
                      style={[styles.songMeta, { color: theme.secondaryText }]}
                    >
                      {song.artist} / {song.album}
                    </Text>
                  </View>
                  <Text style={[styles.duration, { color: theme.primaryText }]}>
                    {formatDurationMs(song.duration)}
                  </Text>
                </Pressable>
                <Pressable
                  accessibilityRole="button"
                  onPress={() => handleRemoveFromQueue(song.id)}
                  style={[styles.removeButton, { borderColor: theme.border }]}
                >
                  <Text style={[styles.removeText, { color: theme.danger }]}>
                    Remove
                  </Text>
                </Pressable>
                <View style={styles.moveButtons}>
                  <Pressable
                    accessibilityLabel={`Move ${song.title} up`}
                    accessibilityRole="button"
                    disabled={!canMoveUp}
                    onPress={() => handleMoveQueueSong(song.id, "up")}
                    style={[
                      styles.moveButton,
                      { borderColor: theme.border },
                      !canMoveUp ? styles.disabled : null,
                    ]}
                  >
                    <Text style={[styles.moveText, { color: theme.accent }]}>
                      Up
                    </Text>
                  </Pressable>
                  <Pressable
                    accessibilityLabel={`Move ${song.title} down`}
                    accessibilityRole="button"
                    disabled={!canMoveDown}
                    onPress={() => handleMoveQueueSong(song.id, "down")}
                    style={[
                      styles.moveButton,
                      { borderColor: theme.border },
                      !canMoveDown ? styles.disabled : null,
                    ]}
                  >
                    <Text style={[styles.moveText, { color: theme.accent }]}>
                      Down
                    </Text>
                  </Pressable>
                </View>
              </View>
            );
          })}
        </View>
      )}

      <View style={styles.actionRow}>
        <Pressable
          accessibilityRole="button"
          disabled={!canClearQueue}
          onPress={handleClearQueue}
          style={[
            styles.clearButton,
            { borderColor: theme.border },
            !canClearQueue ? styles.disabled : null,
          ]}
        >
          <Text style={[styles.removeText, { color: theme.danger }]}>
            Clear queue
          </Text>
        </Pressable>
      </View>

      <Link href="/player" style={[styles.backLink, { color: theme.accent }]}>
        Back to player
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
  emptyPanel: {
    borderRadius: 8,
    borderWidth: 1,
    gap: 8,
    padding: 16,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: "800",
    letterSpacing: 0,
    lineHeight: 21,
  },
  emptyBody: {
    fontSize: 14,
    lineHeight: 20,
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
    fontSize: 18,
    fontWeight: "800",
    letterSpacing: 0,
    lineHeight: 24,
  },
  adActions: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  list: {
    borderRadius: 8,
    borderWidth: 1,
    overflow: "hidden",
  },
  row: {
    alignItems: "center",
    borderBottomWidth: 1,
    flexDirection: "row",
    gap: 12,
    minHeight: 68,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  rowMain: {
    alignItems: "center",
    flex: 1,
    flexDirection: "row",
    gap: 12,
    minWidth: 0,
  },
  index: {
    fontSize: 12,
    fontWeight: "800",
    letterSpacing: 0,
    minWidth: 22,
    textAlign: "right",
  },
  activeIndex: {
    fontSize: 12,
    fontWeight: "800",
    letterSpacing: 0,
    minWidth: 22,
    textAlign: "right",
  },
  rowText: {
    flex: 1,
    gap: 4,
    minWidth: 0,
  },
  songTitle: {
    fontSize: 15,
    fontWeight: "800",
    letterSpacing: 0,
    lineHeight: 20,
  },
  songMeta: {
    fontSize: 13,
    lineHeight: 18,
  },
  duration: {
    fontSize: 13,
    fontWeight: "800",
    letterSpacing: 0,
    minWidth: 44,
    textAlign: "right",
  },
  removeButton: {
    alignItems: "center",
    borderRadius: 8,
    borderWidth: 1,
    justifyContent: "center",
    minHeight: 34,
    minWidth: 76,
    paddingHorizontal: 10,
  },
  moveButtons: {
    flexDirection: "row",
    gap: 6,
  },
  moveButton: {
    alignItems: "center",
    borderRadius: 8,
    borderWidth: 1,
    justifyContent: "center",
    minHeight: 34,
    minWidth: 54,
    paddingHorizontal: 8,
  },
  disabled: {
    opacity: 0.45,
  },
  moveText: {
    fontSize: 11,
    fontWeight: "800",
    letterSpacing: 0,
    textTransform: "uppercase",
  },
  removeText: {
    fontSize: 11,
    fontWeight: "800",
    letterSpacing: 0,
    textTransform: "uppercase",
  },
  premiumButton: {
    alignItems: "center",
    backgroundColor: "#ffffff",
    borderColor: "#fed7aa",
    borderRadius: 8,
    borderWidth: 1,
    justifyContent: "center",
    minHeight: 38,
    paddingHorizontal: 12,
  },
  premiumText: {
    color: "#9a3412",
    fontSize: 11,
    fontWeight: "800",
    letterSpacing: 0,
    textTransform: "uppercase",
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
  clearButton: {
    alignItems: "center",
    alignSelf: "flex-start",
    borderRadius: 8,
    borderWidth: 1,
    justifyContent: "center",
    minHeight: 36,
    paddingHorizontal: 12,
  },
  actionRow: {
    alignItems: "center",
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  backLink: {
    fontSize: 15,
    fontWeight: "800",
    letterSpacing: 0,
  },
});
