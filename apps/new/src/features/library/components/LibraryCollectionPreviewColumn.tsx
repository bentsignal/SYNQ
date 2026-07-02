import { Link } from "expo-router";
import { StyleSheet, Text, View } from "react-native";
import { useCustomizationTheme } from "@/src/features/settings/hooks/use-customization-theme";
import type { LibraryCollectionPreview } from "../hooks/use-library-collection-preview-query";
import { LibraryCollectionPreviewRow } from "./LibraryCollectionPreviewRow";

type LibraryCollectionPreviewColumnProps = {
  collections: LibraryCollectionPreview[];
  title: string;
  total: number;
  viewAllHref:
    | "/(tabs)/library/albums"
    | "/(tabs)/library/artists"
    | "/(tabs)/library/playlists";
};

export function LibraryCollectionPreviewColumn({
  collections,
  title,
  total,
  viewAllHref,
}: LibraryCollectionPreviewColumnProps) {
  const theme = useCustomizationTheme();

  return (
    <View style={styles.column}>
      <View style={styles.columnHeader}>
        <Text style={[styles.columnTitle, { color: theme.secondaryText }]}>
          {title}
        </Text>
        {total > collections.length ? (
          <Link
            href={viewAllHref}
            style={[styles.viewAllLink, { color: theme.accent }]}
          >
            View all
          </Link>
        ) : null}
      </View>
      <View
        style={[
          styles.list,
          { backgroundColor: theme.surface, borderColor: theme.border },
        ]}
      >
        {collections.length === 0 ? (
          <Text style={[styles.placeholder, { color: theme.mutedText }]}>
            None yet
          </Text>
        ) : (
          collections.map((collection) => (
            <LibraryCollectionPreviewRow
              collection={collection}
              key={`${collection.kind}-${collection.id}`}
            />
          ))
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  column: {
    gap: 8,
  },
  columnHeader: {
    alignItems: "center",
    flexDirection: "row",
    gap: 12,
    justifyContent: "space-between",
  },
  columnTitle: {
    fontSize: 12,
    fontWeight: "800",
    letterSpacing: 0,
    textTransform: "uppercase",
  },
  viewAllLink: {
    fontSize: 12,
    fontWeight: "800",
    letterSpacing: 0,
    textTransform: "uppercase",
  },
  list: {
    borderRadius: 8,
    borderWidth: 1,
    overflow: "hidden",
  },
  placeholder: {
    fontSize: 14,
    fontStyle: "italic",
    lineHeight: 20,
    padding: 14,
  },
});
