import { Link } from "expo-router";
import { Text, View } from "react-native";
import { useCustomizationTheme } from "@/src/features/settings/hooks/use-customization-theme";
import type { HomeRecentSongsSectionState } from "../services/home-screen-service";
import { HomeRecentSongList } from "./HomeRecentSongList";

type HomeRecentSongsSectionProps = {
  sectionState: HomeRecentSongsSectionState;
};

export function HomeRecentSongsSection({
  sectionState,
}: HomeRecentSongsSectionProps) {
  const theme = useCustomizationTheme();

  return (
    <>
      <View className="flex-row items-center justify-between gap-3">
        <Text
          className="text-[22px] font-extrabold leading-7"
          style={{ color: theme.primaryText }}
        >
          {sectionState.title}
        </Text>
        <Link
          className="text-[13px] font-extrabold uppercase"
          href={sectionState.libraryHref}
          style={{ color: theme.accent }}
        >
          View library
        </Link>
      </View>

      <HomeRecentSongList
        emptyState={sectionState.emptyState}
        rows={sectionState.rows}
      />
    </>
  );
}
