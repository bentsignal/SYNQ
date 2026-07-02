import { Link } from "expo-router";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { useCustomizationTheme } from "@/src/features/settings/hooks/use-customization-theme";
import type { HomeScreenController } from "../hooks/use-home-screen-controller";
import { HomeRecentSongList } from "./HomeRecentSongList";

type HomeScreenViewProps = HomeScreenController;

export function HomeScreenView({
  hasLibrary,
  nowPlaying,
  recentSongs,
  summary,
}: HomeScreenViewProps) {
  const theme = useCustomizationTheme();

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
            {nowPlaying.playbackLabel}
          </Text>
          <Text style={[styles.nowPlayingTitle, { color: theme.primaryText }]}>
            {nowPlaying.title}
          </Text>
          <Text style={[styles.bodyText, { color: theme.secondaryText }]}>
            {nowPlaying.detailLabel}
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
        <HomeAction
          detail="Files and Wi-Fi"
          href="/(tabs)/import"
          label="Import"
        />
        <HomeAction
          detail="Theme and backup"
          href="/(tabs)/settings"
          label="Settings"
        />
        <HomeAction detail="Unlock listening" href="/premium" label="Premium" />
      </View>

      <View style={styles.sectionHeader}>
        <Text style={[styles.sectionTitle, { color: theme.primaryText }]}>
          Recent Songs
        </Text>
        <Link
          href="/(tabs)/library"
          style={[styles.sectionLink, { color: theme.accent }]}
        >
          View library
        </Link>
      </View>

      <HomeRecentSongList hasLibrary={hasLibrary} recentSongs={recentSongs} />
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
    justifyContent: "center",
    minHeight: 44,
    minWidth: 112,
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
    justifyContent: "center",
    minHeight: 44,
    minWidth: 112,
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
    gap: 12,
    justifyContent: "space-between",
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
});
