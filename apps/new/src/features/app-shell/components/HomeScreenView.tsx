import { ScrollView } from "react-native";
import { useCustomizationTheme } from "@/src/features/settings/hooks/use-customization-theme";
import type { HomeScreenController } from "../hooks/use-home-screen-controller";
import { HomeGuideSection } from "./HomeGuideSection";
import { HomeHero } from "./HomeHero";
import { HomeNowPlayingPanel } from "./HomeNowPlayingPanel";
import { HomeQuickActions } from "./HomeQuickActions";
import { HomeRecentSongsSection } from "./HomeRecentSongsSection";

type HomeScreenViewProps = HomeScreenController;

export function HomeScreenView({
  guideSections,
  hasLibrary,
  nowPlaying,
  recentSongs,
  summary,
}: HomeScreenViewProps) {
  const theme = useCustomizationTheme();

  return (
    <ScrollView
      className="flex-1"
      contentContainerClassName="gap-[22px] px-5 py-14"
      style={{ backgroundColor: theme.background }}
    >
      <HomeHero />
      <HomeNowPlayingPanel nowPlaying={nowPlaying} />
      <HomeQuickActions summary={summary} />
      <HomeGuideSection guideSections={guideSections} />
      <HomeRecentSongsSection
        hasLibrary={hasLibrary}
        recentSongs={recentSongs}
      />
    </ScrollView>
  );
}
