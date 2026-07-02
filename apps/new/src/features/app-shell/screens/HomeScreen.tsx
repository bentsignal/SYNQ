import { Link } from "expo-router";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { useLibrarySongPreviewQuery } from "@/src/features/library/hooks/use-library-song-preview-query";
import { useLibrarySummaryQuery } from "@/src/features/library/hooks/use-library-summary-query";
import { usePlaybackSession } from "@/src/features/playback/hooks/use-playback-session";
import { useCustomizationTheme } from "@/src/features/settings/hooks/use-customization-theme";

const formatDuration = (duration: number | null) => {
  if (!duration || duration <= 0) {
    return "--:--";
  }

  const totalSeconds = Math.round(duration / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;

  return `${minutes}:${seconds.toString().padStart(2, "0")}`;
};

export function HomeScreen() {
  const theme = useCustomizationTheme();
  const summary = useLibrarySummaryQuery();
  const recentSongs = useLibrarySongPreviewQuery({ limit: 4 });
  const { activeTrack, state } = usePlaybackSession();
  const hasLibrary = summary.counts.songs > 0;
  const queueCount = state.queue.length;
  const playbackLabel = activeTrack
    ? state.isPlaying
      ? "Playing now"
      : "Paused"
    : "Nothing playing";

  return (
    <ScrollView
      contentContainerStyle={styles.content}
      style={[styles.screen, { backgroundColor: theme.background }]}
    >
      <View style={styles.header}>
        <Text style={[styles.eyebrow, { color: theme.accent }]}>SYNQ</Text>
        <Text style={[styles.title, { color: theme.primaryText }]}>
          Your music, ready when you are.
        </Text>
        <Text style={[styles.subtitle, { color: theme.secondaryText }]}>
          Import tracks, shape your library, and keep playback moving from one
          place.
        </Text>
      </View>

      <View
        style={[
          styles.nowPlaying,
          { backgroundColor: theme.surface, borderColor: theme.border },
        ]}
      >
        <View style={styles.nowPlayingCopy}>
          <Text style={[styles.sectionLabel, { color: theme.accent }]}>
            {playbackLabel}
          </Text>
          <Text style={[styles.nowPlayingTitle, { color: theme.primaryText }]}>
            {activeTrack?.title ?? "Choose a song to start listening"}
          </Text>
          <Text style={[styles.bodyText, { color: theme.secondaryText }]}>
            {activeTrack
              ? `${activeTrack.artist} - ${formatDuration(activeTrack.duration)}`
              : `${queueCount} songs in queue`}
          </Text>
        </View>
        <View style={styles.nowPlayingActions}>
          <Link asChild href="/player">
            <Pressable
              style={[
                styles.primaryButton,
                { backgroundColor: theme.accent },
              ]}
            >
              <Text style={[styles.primaryButtonText, { color: theme.onAccent }]}>
                Player
              </Text>
            </Pressable>
          </Link>
          <Link asChild href="/queue">
            <Pressable
              style={[
                styles.secondaryButton,
                { borderColor: theme.border, backgroundColor: theme.background },
              ]}
            >
              <Text style={[styles.secondaryButtonText, { color: theme.accent }]}>
                Queue
              </Text>
            </Pressable>
          </Link>
        </View>
      </View>

      <View style={styles.quickActions}>
        <HomeAction
          detail={`${summary.counts.songs} songs`}
          href="/(tabs)/library"
          label="Library"
        />
        <HomeAction detail="Files and Wi-Fi" href="/import" label="Import" />
        <HomeAction detail="Theme and backup" href="/settings" label="Settings" />
        <HomeAction detail="Unlock listening" href="/premium" label="Premium" />
      </View>

      <View style={styles.sectionHeader}>
        <Text style={[styles.sectionTitle, { color: theme.primaryText }]}>
          Recent Songs
        </Text>
        <Link href="/(tabs)/library" style={[styles.sectionLink, { color: theme.accent }]}>
          View library
        </Link>
      </View>

      <View
        style={[
          styles.songList,
          { backgroundColor: theme.surface, borderColor: theme.border },
        ]}
      >
        {hasLibrary && !recentSongs.isEmpty ? (
          recentSongs.songs.map((song) => (
            <Link
              asChild
              href={`/(tabs)/library/song/${song.id}`}
              key={song.id}
            >
              <Pressable
                style={[
                  styles.songRow,
                  { borderBottomColor: theme.borderSubtle },
                ]}
              >
                <View style={styles.songCopy}>
                  <Text
                    numberOfLines={1}
                    style={[styles.songTitle, { color: theme.primaryText }]}
                  >
                    {song.title}
                  </Text>
                  <Text
                    numberOfLines={1}
                    style={[styles.bodyText, { color: theme.secondaryText }]}
                  >
                    {song.artist} - {song.album}
                  </Text>
                </View>
                <Text style={[styles.duration, { color: theme.mutedText }]}>
                  {formatDuration(song.duration)}
                </Text>
              </Pressable>
            </Link>
          ))
        ) : (
          <View style={styles.emptyState}>
            <Text style={[styles.songTitle, { color: theme.primaryText }]}>
              Build your library
            </Text>
            <Text style={[styles.bodyText, { color: theme.secondaryText }]}>
              Import audio files to see recent songs here.
            </Text>
          </View>
        )}
      </View>
    </ScrollView>
  );
}

type HomeActionProps = {
  detail: string;
  href: string;
  label: string;
};

function HomeAction({ detail, href, label }: HomeActionProps) {
  const theme = useCustomizationTheme();

  return (
    <Link asChild href={href}>
      <Pressable
        style={[
          styles.actionCard,
          { backgroundColor: theme.surface, borderColor: theme.border },
        ]}
      >
        <Text style={[styles.actionTitle, { color: theme.primaryText }]}>
          {label}
        </Text>
        <Text style={[styles.actionDetail, { color: theme.secondaryText }]}>
          {detail}
        </Text>
      </Pressable>
    </Link>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  content: {
    gap: 22,
    paddingHorizontal: 20,
    paddingVertical: 56,
  },
  header: {
    gap: 8,
  },
  eyebrow: {
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
    maxWidth: 520,
  },
  subtitle: {
    fontSize: 15,
    lineHeight: 22,
    maxWidth: 520,
  },
  nowPlaying: {
    borderRadius: 8,
    borderWidth: 1,
    gap: 16,
    padding: 16,
  },
  nowPlayingCopy: {
    gap: 6,
  },
  sectionLabel: {
    fontSize: 12,
    fontWeight: "800",
    letterSpacing: 0,
    textTransform: "uppercase",
  },
  nowPlayingTitle: {
    fontSize: 22,
    fontWeight: "800",
    letterSpacing: 0,
    lineHeight: 28,
  },
  bodyText: {
    fontSize: 14,
    lineHeight: 20,
  },
  nowPlayingActions: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  primaryButton: {
    alignItems: "center",
    borderRadius: 8,
    minHeight: 44,
    minWidth: 112,
    justifyContent: "center",
    paddingHorizontal: 18,
  },
  primaryButtonText: {
    fontSize: 14,
    fontWeight: "800",
    letterSpacing: 0,
  },
  secondaryButton: {
    alignItems: "center",
    borderRadius: 8,
    borderWidth: 1,
    minHeight: 44,
    minWidth: 112,
    justifyContent: "center",
    paddingHorizontal: 18,
  },
  secondaryButtonText: {
    fontSize: 14,
    fontWeight: "800",
    letterSpacing: 0,
  },
  quickActions: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  actionCard: {
    borderRadius: 8,
    borderWidth: 1,
    flexBasis: "47%",
    flexGrow: 1,
    gap: 6,
    minHeight: 94,
    minWidth: 148,
    padding: 16,
  },
  actionTitle: {
    fontSize: 17,
    fontWeight: "800",
    letterSpacing: 0,
  },
  actionDetail: {
    fontSize: 13,
    lineHeight: 18,
  },
  sectionHeader: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 12,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: "800",
    letterSpacing: 0,
    lineHeight: 28,
  },
  sectionLink: {
    fontSize: 13,
    fontWeight: "800",
    letterSpacing: 0,
    textTransform: "uppercase",
  },
  songList: {
    borderRadius: 8,
    borderWidth: 1,
    overflow: "hidden",
  },
  songRow: {
    alignItems: "center",
    borderBottomWidth: 1,
    flexDirection: "row",
    gap: 12,
    minHeight: 72,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  songCopy: {
    flex: 1,
    gap: 4,
    minWidth: 0,
  },
  songTitle: {
    fontSize: 16,
    fontWeight: "800",
    letterSpacing: 0,
    lineHeight: 22,
  },
  duration: {
    fontSize: 13,
    fontWeight: "700",
    letterSpacing: 0,
    minWidth: 44,
    textAlign: "right",
  },
  emptyState: {
    gap: 6,
    minHeight: 112,
    justifyContent: "center",
    padding: 16,
  },
});
