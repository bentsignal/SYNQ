import { Link } from "expo-router";
import { Pressable, Text, View } from "react-native";
import { useCustomizationTheme } from "@/src/features/settings/hooks/use-customization-theme";
import type { HomeRecentSongsSectionState } from "../services/home-recent-songs-service";

type HomeRecentSongListProps = {
  emptyState: HomeRecentSongsSectionState["emptyState"];
  rows: HomeRecentSongsSectionState["rows"];
};

export function HomeRecentSongList({
  emptyState,
  rows,
}: HomeRecentSongListProps) {
  const theme = useCustomizationTheme();

  return (
    <View
      className="overflow-hidden rounded-lg border"
      style={{ backgroundColor: theme.surface, borderColor: theme.border }}
    >
      {rows.length > 0 ? (
        rows.map((row) => (
          <Link asChild href={row.href} key={row.song.id}>
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
                  {row.song.title}
                </Text>
                <Text
                  numberOfLines={1}
                  className="text-sm leading-5"
                  style={{ color: theme.secondaryText }}
                >
                  {row.detailLabel}
                </Text>
              </View>
              <Text
                className="min-w-11 text-right text-[13px] font-bold"
                style={{ color: theme.mutedText }}
              >
                {row.durationLabel}
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
            {emptyState.title}
          </Text>
          <Text
            className="text-sm leading-5"
            style={{ color: theme.secondaryText }}
          >
            {emptyState.body}
          </Text>
        </View>
      )}
    </View>
  );
}
