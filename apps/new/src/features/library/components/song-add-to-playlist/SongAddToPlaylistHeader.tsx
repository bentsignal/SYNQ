import { Link } from "expo-router";
import { Text, View } from "react-native";
import type { CustomizationTheme } from "@/src/features/settings/hooks/use-customization-theme";
import type { getSongAddToPlaylistHeaderState } from "../../services/song-add-to-playlist-header-state-service";

type SongAddToPlaylistHeaderProps = {
  headerState: ReturnType<typeof getSongAddToPlaylistHeaderState>;
  theme: CustomizationTheme;
};

export function SongAddToPlaylistHeader({
  headerState,
  theme,
}: SongAddToPlaylistHeaderProps) {
  return (
    <View className="gap-2">
      <Text
        className="text-[13px] font-extrabold uppercase"
        style={{ color: theme.accent }}
      >
        {headerState.copy.kicker}
      </Text>
      <Text
        className="text-[34px] font-extrabold leading-10"
        style={{ color: theme.primaryText }}
      >
        {headerState.copy.title}
      </Text>
      <Link
        className="text-sm font-extrabold uppercase"
        href={headerState.backLink.href}
        style={{ color: theme.accent }}
      >
        {headerState.backLink.label}
      </Link>
    </View>
  );
}

