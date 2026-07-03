import { Link } from "expo-router";
import { Pressable, Text, View } from "react-native";
import { formatDurationMs } from "@/src/features/app-shell/services/duration-format-service";
import { useCustomizationTheme } from "@/src/features/settings/hooks/use-customization-theme";
import type { useLibrarySongPreviewQuery } from "@/src/features/library/hooks/use-library-song-preview-query";
import { getHomeRecentSongHref } from "../services/home-screen-service";

type HomeRecentSongListProps = {
  hasLibrary: boolean;
  recentSongs: ReturnType<typeof useLibrarySongPreviewQuery>;
};

export function HomeRecentSongList({
  hasLibrary,
  recentSongs,
}: HomeRecentSongListProps) {
  const theme = useCustomizationTheme();

  return (
    <View
      className="overflow-hidden rounded-lg border"
      style={{ backgroundColor: theme.surface, borderColor: theme.border }}
    >
      {hasLibrary && !recentSongs.isEmpty ? (
        recentSongs.songs.map((song) => (
          <Link
            asChild
            href={getHomeRecentSongHref({ songId: song.id })}
            key={song.id}
          >
            <Pressable
              className="min-h-[72px] flex-row items-center gap-3 border-b px-4 py-3"
              style={{ borderBottomColor: theme.borderSubtle }}
            >
              <View className="min-w-0 flex-1 gap-1">
                <Text
                  numberOfLines={1}
                  className="text-base font-extrabold leading-[22px]"
                  style={{ color: theme.primaryText }}
                >
                  {song.title}
                </Text>
                <Text
                  numberOfLines={1}
                  className="text-sm leading-5"
                  style={{ color: theme.secondaryText }}
                >
                  {song.artist} - {song.album}
                </Text>
              </View>
              <Text
                className="min-w-11 text-right text-[13px] font-bold"
                style={{ color: theme.mutedText }}
              >
                {formatDurationMs(song.duration)}
              </Text>
            </Pressable>
          </Link>
        ))
      ) : (
        <View className="min-h-28 justify-center gap-1.5 p-4">
          <Text
            className="text-base font-extrabold leading-[22px]"
            style={{ color: theme.primaryText }}
          >
            Build your library
          </Text>
          <Text
            className="text-sm leading-5"
            style={{ color: theme.secondaryText }}
          >
            Import audio files to see recent songs here.
          </Text>
        </View>
      )}
    </View>
  );
}
