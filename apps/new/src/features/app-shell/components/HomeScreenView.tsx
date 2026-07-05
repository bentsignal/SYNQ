import { ScrollView } from "react-native";
import { useCustomizationTheme } from "@/src/features/settings/hooks/use-customization-theme";
import type { HomeScreenController } from "../hooks/use-home-screen-controller";
import {
  getHomeNowPlayingActions,
  getHomeQuickActions,
  getHomeRecentSongsSectionState,
} from "../services/home-screen-service";
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
  const nowPlayingActions = getHomeNowPlayingActions();
  const quickActions = getHomeQuickActions({
    songCount: summary.counts.songs,
  });
  const recentSongsSectionState = getHomeRecentSongsSectionState({
    hasLibrary,
    songs: recentSongs.songs,
  });

  return (
    <ScrollView
      className="flex-1"
      contentContainerClassName="gap-[22px] px-5 py-14"
      style={{ backgroundColor: theme.background }}
    >
      <HomeHero />
      <HomeNowPlayingPanel
        actions={nowPlayingActions}
        nowPlaying={nowPlaying}
      />
      <HomeQuickActions actions={quickActions} />
      <HomeGuideSection guideSections={guideSections} />
      <HomeRecentSongsSection sectionState={recentSongsSectionState} />
    </ScrollView>
  );
}
