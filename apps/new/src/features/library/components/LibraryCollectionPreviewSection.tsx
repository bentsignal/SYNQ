import { Link } from "expo-router";
import { Image, Pressable, StyleSheet, Text, View } from "react-native";
import { useCustomizationTheme } from "@/src/features/settings/hooks/use-customization-theme";
import type { LibraryCollectionPreview } from "../hooks/use-library-collection-preview-query";

type LibraryCollectionPreviewSectionProps = {
  collections: {
    albums: LibraryCollectionPreview[];
    artists: LibraryCollectionPreview[];
    playlists: LibraryCollectionPreview[];
  };
  isEmpty: boolean;
};

const sections: {
  key: keyof LibraryCollectionPreviewSectionProps["collections"];
  title: string;
}[] = [
  {
    key: "playlists",
    title: "Playlists",
  },
  {
    key: "albums",
    title: "Albums",
  },
  {
    key: "artists",
    title: "Artists",
  },
];

const getCollectionHref = (collection: LibraryCollectionPreview) => {
  switch (collection.kind) {
    case "albums":
      return `/(tabs)/library/album/${collection.id}` as const;
    case "artists":
      return `/(tabs)/library/artist/${collection.id}` as const;
    case "playlists":
    default:
      return `/(tabs)/library/playlist/${collection.id}` as const;
  }
};

export function LibraryCollectionPreviewSection({
  collections,
  isEmpty,
}: LibraryCollectionPreviewSectionProps) {
  const theme = useCustomizationTheme();

  return (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <Text style={[styles.sectionTitle, { color: theme.primaryText }]}>
          Collections
        </Text>
        <Text style={[styles.sectionMeta, { color: theme.secondaryText }]}>
          Live database
        </Text>
      </View>

      {isEmpty ? (
        <View
          style={[
            styles.emptyPanel,
            { backgroundColor: theme.surface, borderColor: theme.border },
          ]}
        >
          <Text style={[styles.emptyTitle, { color: theme.primaryText }]}>
            No collections yet
          </Text>
          <Text style={[styles.emptyBody, { color: theme.secondaryText }]}>
            Playlists, albums, and artists will populate here as the shared
            library database changes.
          </Text>
        </View>
      ) : (
        <View style={styles.columns}>
          {sections.map((section) => (
            <View key={section.key} style={styles.column}>
              <Text style={[styles.columnTitle, { color: theme.secondaryText }]}>
                {section.title}
              </Text>
              <View
                style={[
                  styles.list,
                  { backgroundColor: theme.surface, borderColor: theme.border },
                ]}
              >
                {collections[section.key].length === 0 ? (
                  <Text style={[styles.placeholder, { color: theme.mutedText }]}>
                    None yet
                  </Text>
                ) : (
                  collections[section.key].map((collection) => (
                    <Link
                      asChild
                      href={getCollectionHref(collection)}
                      key={`${collection.kind}-${collection.id}`}
                    >
                      <Pressable
                        style={[
                          styles.row,
                          { borderBottomColor: theme.borderSubtle },
                        ]}
                      >
                        {collection.imagePath ? (
                          <Image
                            source={{ uri: collection.imagePath }}
                            style={styles.thumbnail}
                          />
                        ) : (
                          <View
                            style={[
                              styles.thumbnailPlaceholder,
                              { backgroundColor: theme.background },
                            ]}
                          >
                            <Text
                              style={[
                                styles.thumbnailInitial,
                                { color: theme.accent },
                              ]}
                            >
                              {collection.title.slice(0, 1).toUpperCase()}
                            </Text>
                          </View>
                        )}
                        <View style={styles.rowText}>
                          <Text
                            numberOfLines={1}
                            style={[styles.title, { color: theme.primaryText }]}
                          >
                            {collection.title}
                          </Text>
                          <Text
                            numberOfLines={1}
                            style={[
                              styles.meta,
                              { color: theme.secondaryText },
                            ]}
                          >
                            {collection.meta}
                          </Text>
                        </View>
                        <Text
                          style={[styles.detail, { color: theme.primaryText }]}
                        >
                          {collection.detail}
                        </Text>
                      </Pressable>
                    </Link>
                  ))
                )}
              </View>
            </View>
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
  emptyPanel: {
    borderRadius: 8,
    borderWidth: 1,
    gap: 8,
    padding: 16,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: "800",
    letterSpacing: 0,
    lineHeight: 21,
  },
  emptyBody: {
    fontSize: 14,
    lineHeight: 20,
  },
  columns: {
    gap: 12,
  },
  column: {
    gap: 8,
  },
  columnTitle: {
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
  row: {
    alignItems: "center",
    borderBottomWidth: 1,
    flexDirection: "row",
    gap: 12,
    minHeight: 62,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  thumbnail: {
    borderRadius: 6,
    height: 42,
    width: 42,
  },
  thumbnailPlaceholder: {
    alignItems: "center",
    borderRadius: 6,
    height: 42,
    justifyContent: "center",
    width: 42,
  },
  thumbnailInitial: {
    fontSize: 16,
    fontWeight: "800",
    letterSpacing: 0,
    lineHeight: 21,
  },
  rowText: {
    flex: 1,
    gap: 4,
    minWidth: 0,
  },
  title: {
    fontSize: 15,
    fontWeight: "800",
    letterSpacing: 0,
    lineHeight: 20,
  },
  meta: {
    fontSize: 13,
    lineHeight: 18,
  },
  detail: {
    fontSize: 12,
    fontWeight: "800",
    letterSpacing: 0,
    maxWidth: 110,
    textAlign: "right",
  },
  placeholder: {
    fontSize: 14,
    fontStyle: "italic",
    lineHeight: 20,
    padding: 14,
  },
});
