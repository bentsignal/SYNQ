import { Text, View } from "react-native";
import { useCustomizationTheme } from "@/src/features/settings/hooks/use-customization-theme";
import type { LibraryCollectionPreview } from "../hooks/use-library-collection-preview-query";
import { LibraryCollectionPreviewColumn } from "./LibraryCollectionPreviewColumn";
import { LibraryCollectionPreviewEmptyState } from "./LibraryCollectionPreviewEmptyState";

type LibraryCollectionPreviewSectionProps = {
  collections: {
    albums: LibraryCollectionPreview[];
    artists: LibraryCollectionPreview[];
    playlists: LibraryCollectionPreview[];
  };
  isEmpty: boolean;
  totals: {
    albums: number;
    artists: number;
    playlists: number;
  };
};

const sections: {
  key: keyof LibraryCollectionPreviewSectionProps["collections"];
  title: string;
  viewAllHref: "/(tabs)/library/albums" | "/(tabs)/library/artists" | "/(tabs)/library/playlists";
}[] = [
  {
    key: "playlists",
    title: "Playlists",
    viewAllHref: "/(tabs)/library/playlists",
  },
  {
    key: "albums",
    title: "Albums",
    viewAllHref: "/(tabs)/library/albums",
  },
  {
    key: "artists",
    title: "Artists",
    viewAllHref: "/(tabs)/library/artists",
  },
];

export function LibraryCollectionPreviewSection({
  collections,
  isEmpty,
  totals,
}: LibraryCollectionPreviewSectionProps) {
  const theme = useCustomizationTheme();

  return (
    <View className="gap-3">
      <View className="flex-row items-end justify-between gap-3">
        <Text
          className="flex-1 text-xl font-extrabold leading-[25px] tracking-normal"
          style={{ color: theme.primaryText }}
        >
          Collections
        </Text>
        <Text
          className="text-xs font-extrabold uppercase leading-[17px] tracking-normal"
          style={{ color: theme.secondaryText }}
        >
          Playlists, albums, artists
        </Text>
      </View>

      {isEmpty ? (
        <LibraryCollectionPreviewEmptyState />
      ) : (
        <View className="gap-3">
          {sections.map((section) => (
            <LibraryCollectionPreviewColumn
              collections={collections[section.key]}
              key={section.key}
              title={section.title}
              total={totals[section.key]}
              viewAllHref={section.viewAllHref}
            />
          ))}
        </View>
      )}
    </View>
  );
}
