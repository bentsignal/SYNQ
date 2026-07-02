import { Link } from "expo-router";
import { Image, Pressable, StyleSheet, Text, View } from "react-native";
import { useCustomizationTheme } from "@/src/features/settings/hooks/use-customization-theme";
import type { LibraryCollectionListState } from "../services/library-collection-list-service";
import { getLibraryCollectionPreviewHref } from "../services/library-collection-preview-service";

type LibraryCollectionListProps = {
  listState: LibraryCollectionListState;
};

export function LibraryCollectionList({ listState }: LibraryCollectionListProps) {
  const theme = useCustomizationTheme();

  return (
    <View
      style={[
        styles.list,
        { backgroundColor: theme.surface, borderColor: theme.border },
      ]}
    >
      {listState.visibleCollections.length === 0 ? (
        <Text style={[styles.emptyText, { color: theme.mutedText }]}>
          {listState.emptyLabel}
        </Text>
      ) : (
        listState.visibleCollections.map((collection) => (
          <Link
            asChild
            href={getLibraryCollectionPreviewHref(collection)}
            key={`${collection.kind}-${collection.id}`}
          >
            <Pressable
              style={[styles.row, { borderBottomColor: theme.borderSubtle }]}
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
                    style={[styles.thumbnailInitial, { color: theme.accent }]}
                  >
                    {collection.title.slice(0, 1).toUpperCase()}
                  </Text>
                </View>
              )}
              <View style={styles.rowText}>
                <Text
                  numberOfLines={1}
                  style={[styles.collectionTitle, { color: theme.primaryText }]}
                >
                  {collection.title}
                </Text>
                <Text
                  numberOfLines={1}
                  style={[
                    styles.collectionMeta,
                    { color: theme.secondaryText },
                  ]}
                >
                  {collection.meta}
                </Text>
              </View>
              <Text style={[styles.detail, { color: theme.primaryText }]}>
                {collection.detail}
              </Text>
            </Pressable>
          </Link>
        ))
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  collectionMeta: {
    fontSize: 13,
    lineHeight: 18,
  },
  collectionTitle: {
    fontSize: 15,
    fontWeight: "800",
    letterSpacing: 0,
    lineHeight: 20,
  },
  detail: {
    fontSize: 12,
    fontWeight: "800",
    letterSpacing: 0,
    maxWidth: 118,
    textAlign: "right",
  },
  emptyText: {
    fontSize: 14,
    fontStyle: "italic",
    lineHeight: 20,
    padding: 14,
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
    minHeight: 64,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  rowText: {
    flex: 1,
    gap: 4,
    minWidth: 0,
  },
  thumbnail: {
    borderRadius: 6,
    height: 44,
    width: 44,
  },
  thumbnailInitial: {
    fontSize: 16,
    fontWeight: "800",
    letterSpacing: 0,
    lineHeight: 21,
  },
  thumbnailPlaceholder: {
    alignItems: "center",
    borderRadius: 6,
    height: 44,
    justifyContent: "center",
    width: 44,
  },
});
