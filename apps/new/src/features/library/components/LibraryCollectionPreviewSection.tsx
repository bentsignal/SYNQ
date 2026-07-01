import { Link } from "expo-router";
import { Pressable, StyleSheet, Text, View } from "react-native";
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
  return (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Collections</Text>
        <Text style={styles.sectionMeta}>Live database</Text>
      </View>

      {isEmpty ? (
        <View style={styles.emptyPanel}>
          <Text style={styles.emptyTitle}>No collections yet</Text>
          <Text style={styles.emptyBody}>
            Playlists, albums, and artists will populate here as the shared
            library database changes.
          </Text>
        </View>
      ) : (
        <View style={styles.columns}>
          {sections.map((section) => (
            <View key={section.key} style={styles.column}>
              <Text style={styles.columnTitle}>{section.title}</Text>
              <View style={styles.list}>
                {collections[section.key].length === 0 ? (
                  <Text style={styles.placeholder}>None yet</Text>
                ) : (
                  collections[section.key].map((collection) => (
                    <Link
                      asChild
                      href={getCollectionHref(collection)}
                      key={`${collection.kind}-${collection.id}`}
                    >
                      <Pressable style={styles.row}>
                        <View style={styles.rowText}>
                          <Text numberOfLines={1} style={styles.title}>
                            {collection.title}
                          </Text>
                          <Text numberOfLines={1} style={styles.meta}>
                            {collection.meta}
                          </Text>
                        </View>
                        <Text style={styles.detail}>{collection.detail}</Text>
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
    color: "#121417",
    flex: 1,
    fontSize: 20,
    fontWeight: "800",
    letterSpacing: 0,
    lineHeight: 25,
  },
  sectionMeta: {
    color: "#52605a",
    fontSize: 12,
    fontWeight: "800",
    letterSpacing: 0,
    lineHeight: 17,
    textTransform: "uppercase",
  },
  emptyPanel: {
    backgroundColor: "#ffffff",
    borderColor: "#dbe3de",
    borderRadius: 8,
    borderWidth: 1,
    gap: 8,
    padding: 16,
  },
  emptyTitle: {
    color: "#121417",
    fontSize: 16,
    fontWeight: "800",
    letterSpacing: 0,
    lineHeight: 21,
  },
  emptyBody: {
    color: "#52605a",
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
    color: "#52605a",
    fontSize: 12,
    fontWeight: "800",
    letterSpacing: 0,
    textTransform: "uppercase",
  },
  list: {
    backgroundColor: "#ffffff",
    borderColor: "#dbe3de",
    borderRadius: 8,
    borderWidth: 1,
    overflow: "hidden",
  },
  row: {
    alignItems: "center",
    borderBottomColor: "#edf2ef",
    borderBottomWidth: 1,
    flexDirection: "row",
    gap: 12,
    minHeight: 62,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  rowText: {
    flex: 1,
    gap: 4,
    minWidth: 0,
  },
  title: {
    color: "#121417",
    fontSize: 15,
    fontWeight: "800",
    letterSpacing: 0,
    lineHeight: 20,
  },
  meta: {
    color: "#52605a",
    fontSize: 13,
    lineHeight: 18,
  },
  detail: {
    color: "#29322e",
    fontSize: 12,
    fontWeight: "800",
    letterSpacing: 0,
    maxWidth: 110,
    textAlign: "right",
  },
  placeholder: {
    color: "#74807a",
    fontSize: 14,
    fontStyle: "italic",
    lineHeight: 20,
    padding: 14,
  },
});
