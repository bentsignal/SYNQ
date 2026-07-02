import { Link } from "expo-router";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { usePlaybackSession } from "../hooks/use-playback-session";

const formatDuration = (duration: number | null) => {
  if (!duration) {
    return "--:--";
  }

  const totalSeconds = Math.round(duration / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;

  return `${minutes}:${seconds.toString().padStart(2, "0")}`;
};

export function PlaybackQueueScreen() {
  const {
    activeTrack,
    clearQueue,
    moveQueueSong,
    playSong,
    removeFromQueue,
    state,
  } = usePlaybackSession();
  const adBreakActive = state.adGate.active || state.adGate.due;

  return (
    <ScrollView contentContainerStyle={styles.content} style={styles.scroll}>
      <View style={styles.header}>
        <Text style={styles.kicker}>Playback queue</Text>
        <Text style={styles.title}>Now Playing</Text>
        <Text style={styles.subtitle}>
          Queue state is owned by the playback feature boundary.
        </Text>
      </View>

      {adBreakActive ? (
        <View style={styles.adPanel}>
          <Text style={styles.panelLabel}>Premium gate</Text>
          <Text style={styles.adTitle}>Ad break required</Text>
          <Text style={styles.panelText}>
            Queue playback commands are paused while the bundled ad plays. Your
            song resumes automatically when the ad finishes.
          </Text>
          <View style={styles.adActions}>
            <Link asChild href="/premium">
              <Pressable accessibilityRole="button" style={styles.premiumButton}>
                <Text style={styles.premiumText}>Open Premium</Text>
              </Pressable>
            </Link>
          </View>
        </View>
      ) : null}

      {state.queue.length === 0 ? (
        <View style={styles.emptyPanel}>
          <Text style={styles.emptyTitle}>Queue is empty</Text>
          <Text style={styles.emptyBody}>
            Open a song from Library to seed the rewrite playback session.
          </Text>
        </View>
      ) : (
        <View style={styles.list}>
          {state.queue.map((song, index) => {
            const isActive = activeTrack?.id === song.id;

            return (
              <View key={song.id} style={styles.row}>
                <Pressable
                  accessibilityRole="button"
                  disabled={adBreakActive}
                  onPress={() => playSong(song)}
                  style={[styles.rowMain, adBreakActive ? styles.disabled : null]}
                >
                  <Text style={isActive ? styles.activeIndex : styles.index}>
                    {index + 1}
                  </Text>
                  <View style={styles.rowText}>
                    <Text numberOfLines={1} style={styles.songTitle}>
                      {song.title}
                    </Text>
                    <Text numberOfLines={1} style={styles.songMeta}>
                      {song.artist} / {song.album}
                    </Text>
                  </View>
                  <Text style={styles.duration}>
                    {formatDuration(song.duration)}
                  </Text>
                </Pressable>
                <Pressable
                  accessibilityRole="button"
                  onPress={() => removeFromQueue(song.id)}
                  style={styles.removeButton}
                >
                  <Text style={styles.removeText}>Remove</Text>
                </Pressable>
                <View style={styles.moveButtons}>
                  <Pressable
                    accessibilityLabel={`Move ${song.title} up`}
                    accessibilityRole="button"
                    disabled={index === 0}
                    onPress={() => moveQueueSong(song.id, "up")}
                    style={[
                      styles.moveButton,
                      index === 0 ? styles.disabled : null,
                    ]}
                  >
                    <Text style={styles.moveText}>Up</Text>
                  </Pressable>
                  <Pressable
                    accessibilityLabel={`Move ${song.title} down`}
                    accessibilityRole="button"
                    disabled={index === state.queue.length - 1}
                    onPress={() => moveQueueSong(song.id, "down")}
                    style={[
                      styles.moveButton,
                      index === state.queue.length - 1 ? styles.disabled : null,
                    ]}
                  >
                    <Text style={styles.moveText}>Down</Text>
                  </Pressable>
                </View>
              </View>
            );
          })}
        </View>
      )}

      <View style={styles.panel}>
        <Text style={styles.panelLabel}>Revision</Text>
        <Text style={styles.panelText}>{state.queueRevision}</Text>
        <Pressable
          accessibilityRole="button"
          disabled={state.queue.length === 0}
          onPress={clearQueue}
          style={[
            styles.clearButton,
            state.queue.length === 0 ? styles.disabled : null,
          ]}
        >
          <Text style={styles.removeText}>Clear queue</Text>
        </Pressable>
      </View>

      <Link href="/player" style={styles.backLink}>
        Back to player
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
  emptyPanel: {
    backgroundColor: "#ffffff",
    borderColor: "#dbe3de",
    borderRadius: 8,
    borderWidth: 1,
    gap: 8,
    padding: 16,
  },
  emptyTitle: {
    color: "#121417",
    fontSize: 16,
    fontWeight: "800",
    letterSpacing: 0,
    lineHeight: 21,
  },
  emptyBody: {
    color: "#52605a",
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
    backgroundColor: "#ffffff",
    borderColor: "#dbe3de",
    borderRadius: 8,
    borderWidth: 1,
    overflow: "hidden",
  },
  row: {
    alignItems: "center",
    borderBottomColor: "#edf2ef",
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
    color: "#74807a",
    fontSize: 12,
    fontWeight: "800",
    letterSpacing: 0,
    minWidth: 22,
    textAlign: "right",
  },
  activeIndex: {
    color: "#0f766e",
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
    color: "#121417",
    fontSize: 15,
    fontWeight: "800",
    letterSpacing: 0,
    lineHeight: 20,
  },
  songMeta: {
    color: "#52605a",
    fontSize: 13,
    lineHeight: 18,
  },
  duration: {
    color: "#29322e",
    fontSize: 13,
    fontWeight: "800",
    letterSpacing: 0,
    minWidth: 44,
    textAlign: "right",
  },
  removeButton: {
    alignItems: "center",
    borderColor: "#dbe3de",
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
    borderColor: "#dbe3de",
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
    color: "#0f766e",
    fontSize: 11,
    fontWeight: "800",
    letterSpacing: 0,
    textTransform: "uppercase",
  },
  removeText: {
    color: "#b42318",
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
  panel: {
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
  panelText: {
    color: "#52605a",
    fontSize: 14,
    lineHeight: 20,
  },
  clearButton: {
    alignItems: "center",
    alignSelf: "flex-start",
    borderColor: "#dbe3de",
    borderRadius: 8,
    borderWidth: 1,
    justifyContent: "center",
    minHeight: 36,
    paddingHorizontal: 12,
  },
  backLink: {
    color: "#0f766e",
    fontSize: 15,
    fontWeight: "800",
    letterSpacing: 0,
  },
});
