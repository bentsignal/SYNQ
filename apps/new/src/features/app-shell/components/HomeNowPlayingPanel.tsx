import { Link } from "expo-router";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { useCustomizationTheme } from "@/src/features/settings/hooks/use-customization-theme";
import type { HomeScreenController } from "../hooks/use-home-screen-controller";

type HomeNowPlayingPanelProps = {
  nowPlaying: HomeScreenController["nowPlaying"];
};

export function HomeNowPlayingPanel({
  nowPlaying,
}: HomeNowPlayingPanelProps) {
  const theme = useCustomizationTheme();

  return (
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
            style={[styles.primaryButton, { backgroundColor: theme.accent }]}
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
  );
}

const styles = StyleSheet.create({
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
});
