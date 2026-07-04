import { Link } from "expo-router";
import { Text, View } from "react-native";
import { useCustomizationTheme } from "@/src/features/settings/hooks/use-customization-theme";
import type { HomeScreenController } from "../hooks/use-home-screen-controller";
import { getHomeRecentSongsSectionState } from "../services/home-screen-service";
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
  const state = getHomeRecentSongsSectionState({
    hasLibrary,
    songs: recentSongs.songs,
  });

  return (
    <>
      <View className="flex-row items-center justify-between gap-3">
        <Text
          className="text-[22px] font-extrabold leading-7"
          style={{ color: theme.primaryText }}
        >
          {state.title}
        </Text>
        <Link
          className="text-[13px] font-extrabold uppercase"
          href={state.libraryHref}
          style={{ color: theme.accent }}
        >
          View library
        </Link>
      </View>

      <HomeRecentSongList
        emptyState={state.emptyState}
        rows={state.rows}
      />
    </>
  );
}
