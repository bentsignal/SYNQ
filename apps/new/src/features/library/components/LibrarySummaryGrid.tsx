import { Text, View } from "react-native";
import { useCustomizationTheme } from "@/src/features/settings/hooks/use-customization-theme";

const summaryItems = [
  {
    key: "songs",
    label: "Songs",
  },
  {
    key: "playlists",
    label: "Playlists",
  },
  {
    key: "albums",
    label: "Albums",
  },
  {
    key: "artists",
    label: "Artists",
  },
] as const;

type LibrarySummaryCounts = Record<(typeof summaryItems)[number]["key"], number>;

type LibrarySummaryGridProps = {
  counts: LibrarySummaryCounts;
};

export function LibrarySummaryGrid({ counts }: LibrarySummaryGridProps) {
  const theme = useCustomizationTheme();

  return (
    <View className="flex-row flex-wrap gap-3">
      {summaryItems.map((item) => (
        <View
          className="min-h-24 min-w-[140px] flex-grow basis-[47%] gap-1.5 rounded-lg border p-4"
          key={item.key}
          style={{ backgroundColor: theme.surface, borderColor: theme.border }}
        >
          <Text
            className="text-3xl font-extrabold leading-9 tracking-normal"
            style={{ color: theme.primaryText }}
          >
            {counts[item.key]}
          </Text>
          <Text
            className="text-[13px] font-extrabold uppercase tracking-normal"
            style={{ color: theme.secondaryText }}
          >
            {item.label}
          </Text>
        </View>
      ))}
    </View>
  );
}
