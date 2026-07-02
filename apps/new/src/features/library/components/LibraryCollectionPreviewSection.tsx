import { StyleSheet, Text, View } from "react-native";
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
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <Text style={[styles.sectionTitle, { color: theme.primaryText }]}>
          Collections
        </Text>
        <Text style={[styles.sectionMeta, { color: theme.secondaryText }]}>
          Playlists, albums, artists
        </Text>
      </View>

      {isEmpty ? (
        <LibraryCollectionPreviewEmptyState />
      ) : (
        <View style={styles.columns}>
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

const styles = StyleSheet.create({
  section: {
    gap: 12,
  },
  sectionHeader: {
    alignItems: "flex-end",
    flexDirection: "row",
    gap: 12,
    justifyContent: "space-between",
  },
  sectionTitle: {
    flex: 1,
    fontSize: 20,
    fontWeight: "800",
    letterSpacing: 0,
    lineHeight: 25,
  },
  sectionMeta: {
    fontSize: 12,
    fontWeight: "800",
    letterSpacing: 0,
    lineHeight: 17,
    textTransform: "uppercase",
  },
  columns: {
    gap: 12,
  },
});
