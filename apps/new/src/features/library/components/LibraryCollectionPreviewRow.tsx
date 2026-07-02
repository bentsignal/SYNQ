import { Link } from "expo-router";
import { Image, Pressable, StyleSheet, Text, View } from "react-native";
import { useCustomizationTheme } from "@/src/features/settings/hooks/use-customization-theme";
import type { LibraryCollectionPreview } from "../hooks/use-library-collection-preview-query";
import { getLibraryCollectionPreviewHref } from "../services/library-collection-preview-service";

type LibraryCollectionPreviewRowProps = {
  collection: LibraryCollectionPreview;
};

export function LibraryCollectionPreviewRow({
  collection,
}: LibraryCollectionPreviewRowProps) {
  const theme = useCustomizationTheme();

  return (
    <Link
      asChild
      href={getLibraryCollectionPreviewHref(collection)}
      key={`${collection.kind}-${collection.id}`}
    >
      <Pressable
        style={[styles.row, { borderBottomColor: theme.borderSubtle }]}
      >
        {collection.imagePath ? (
          <Image source={{ uri: collection.imagePath }} style={styles.thumbnail} />
        ) : (
          <View
            style={[
              styles.thumbnailPlaceholder,
              { backgroundColor: theme.background },
            ]}
          >
            <Text style={[styles.thumbnailInitial, { color: theme.accent }]}>
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
            style={[styles.meta, { color: theme.secondaryText }]}
          >
            {collection.meta}
          </Text>
        </View>
        <Text style={[styles.detail, { color: theme.primaryText }]}>
          {collection.detail}
        </Text>
      </Pressable>
    </Link>
  );
}

const styles = StyleSheet.create({
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
});
