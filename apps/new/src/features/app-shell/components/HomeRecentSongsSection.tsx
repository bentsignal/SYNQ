import { Link } from "expo-router";
import { StyleSheet, Text, View } from "react-native";
import { useCustomizationTheme } from "@/src/features/settings/hooks/use-customization-theme";
import type { HomeScreenController } from "../hooks/use-home-screen-controller";
import { HomeRecentSongList } from "./HomeRecentSongList";

type HomeRecentSongsSectionProps = Pick<
  HomeScreenController,
  "hasLibrary" | "recentSongs"
>;

export function HomeRecentSongsSection({
  hasLibrary,
  recentSongs,
}: HomeRecentSongsSectionProps) {
  const theme = useCustomizationTheme();

  return (
    <>
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
    </>
  );
}

const styles = StyleSheet.create({
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
