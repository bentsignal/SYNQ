import { useMemo, useState } from "react";
import { Link } from "expo-router";
import {
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { useCustomizationTheme } from "@/src/features/settings/hooks/use-customization-theme";
import {
  type CollectionKind,
  type LibraryCollectionPreview,
  useLibraryCollectionPreviewQuery,
} from "../hooks/use-library-collection-preview-query";

type LibraryCollectionListScreenProps = {
  kind: CollectionKind;
};

const copyByKind = {
  albums: {
    createHref: "/(tabs)/library/album/create",
    empty: "No albums in library",
    kicker: "Library",
    placeholder: "Search albums or artists",
    title: "Albums",
  },
  artists: {
    createHref: "/(tabs)/library/artist/create",
    empty: "No artists in library",
    kicker: "Library",
    placeholder: "Search artists",
    title: "Artists",
  },
  playlists: {
    createHref: "/(tabs)/library/playlist/create",
    empty: "No playlists in library",
    kicker: "Library",
    placeholder: "Search playlists",
    title: "Playlists",
  },
} satisfies Record<
  CollectionKind,
  {
    createHref: string;
    empty: string;
    kicker: string;
    placeholder: string;
    title: string;
  }
>;

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

const matchesQuery = (collection: LibraryCollectionPreview, query: string) => {
  const normalizedQuery = query.trim().toLowerCase();

  if (!normalizedQuery) {
    return true;
  }

  return [collection.title, collection.meta, collection.detail].some((value) =>
    value.toLowerCase().includes(normalizedQuery),
  );
};

export function LibraryCollectionListScreen({
  kind,
}: LibraryCollectionListScreenProps) {
  const theme = useCustomizationTheme();
  const [query, setQuery] = useState("");
  const { collections, errors, updatedAt } = useLibraryCollectionPreviewQuery({
    limit: null,
  });
  const copy = copyByKind[kind];
  const visibleCollections = useMemo(
    () =>
      collections[kind].filter((collection) =>
        matchesQuery(collection, query),
      ),
    [collections, kind, query],
  );
  const hasErrors = errors.length > 0;
  const updatedLabel =
    updatedAt > 0
      ? `Updated ${new Date(updatedAt).toLocaleTimeString()}`
      : "Waiting for library data";

  return (
    <ScrollView
      contentContainerStyle={styles.content}
      style={[styles.screen, { backgroundColor: theme.background }]}
    >
      <View style={styles.header}>
        <Text style={[styles.kicker, { color: theme.accent }]}>
          {copy.kicker}
        </Text>
        <Text style={[styles.title, { color: theme.primaryText }]}>
          {copy.title}
        </Text>
        <View style={styles.links}>
          <Link
            href="/(tabs)/library"
            style={[styles.link, { color: theme.accent }]}
          >
            Library
          </Link>
          <Link href={copy.createHref} style={[styles.link, { color: theme.accent }]}>
            Create
          </Link>
        </View>
      </View>

      <TextInput
        autoCapitalize="none"
        autoCorrect={false}
        onChangeText={setQuery}
        placeholder={copy.placeholder}
        placeholderTextColor={theme.mutedText}
        returnKeyType="search"
        style={[
          styles.searchInput,
          {
            backgroundColor: theme.surface,
            borderColor: theme.border,
            color: theme.primaryText,
          },
        ]}
        value={query}
      />

      <View
        style={[
          styles.list,
          { backgroundColor: theme.surface, borderColor: theme.border },
        ]}
      >
        {visibleCollections.length === 0 ? (
          <Text style={[styles.emptyText, { color: theme.mutedText }]}>
            {query.trim() ? "No matching collections" : copy.empty}
          </Text>
        ) : (
          visibleCollections.map((collection) => (
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
                    style={[styles.collectionTitle, { color: theme.primaryText }]}
                  >
                    {collection.title}
                  </Text>
                  <Text
                    numberOfLines={1}
                    style={[styles.collectionMeta, { color: theme.secondaryText }]}
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

      <View
        style={[
          styles.statusPanel,
          { backgroundColor: theme.surface, borderColor: theme.border },
        ]}
      >
        <Text
          style={[
            hasErrors ? styles.errorText : styles.statusText,
            { color: hasErrors ? theme.danger : theme.secondaryText },
          ]}
        >
          {hasErrors ? "One or more collection queries failed." : updatedLabel}
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  content: {
    gap: 18,
    paddingHorizontal: 20,
    paddingVertical: 56,
  },
  header: {
    gap: 8,
  },
  kicker: {
    fontSize: 13,
    fontWeight: "800",
    letterSpacing: 0,
    textTransform: "uppercase",
  },
  title: {
    fontSize: 34,
    fontWeight: "800",
    letterSpacing: 0,
    lineHeight: 40,
  },
  links: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  link: {
    fontSize: 14,
    fontWeight: "800",
    letterSpacing: 0,
    textTransform: "uppercase",
  },
  searchInput: {
    borderRadius: 8,
    borderWidth: 1,
    fontSize: 15,
    minHeight: 46,
    paddingHorizontal: 14,
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
  thumbnail: {
    borderRadius: 6,
    height: 44,
    width: 44,
  },
  thumbnailPlaceholder: {
    alignItems: "center",
    borderRadius: 6,
    height: 44,
    justifyContent: "center",
    width: 44,
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
  collectionTitle: {
    fontSize: 15,
    fontWeight: "800",
    letterSpacing: 0,
    lineHeight: 20,
  },
  collectionMeta: {
    fontSize: 13,
    lineHeight: 18,
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
  statusPanel: {
    borderRadius: 8,
    borderWidth: 1,
    padding: 16,
  },
  statusText: {
    fontSize: 14,
    lineHeight: 20,
  },
  errorText: {
    fontSize: 14,
    fontWeight: "700",
    lineHeight: 20,
  },
});
