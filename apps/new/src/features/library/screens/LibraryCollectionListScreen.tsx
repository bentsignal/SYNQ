import { Link } from "expo-router";
import {
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { useCustomizationTheme } from "@/src/features/settings/hooks/use-customization-theme";
import { LibraryCollectionList } from "../components/LibraryCollectionList";
import { useLibraryCollectionListController } from "../hooks/use-library-collection-list-controller";
import {
  type CollectionKind,
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

export function LibraryCollectionListScreen({
  kind,
}: LibraryCollectionListScreenProps) {
  const theme = useCustomizationTheme();
  const copy = copyByKind[kind];
  const { listState, query, setQuery } = useLibraryCollectionListController({
    emptyLabel: copy.empty,
    kind,
  });

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

      <LibraryCollectionList listState={listState} />

      <View
        style={[
          styles.statusPanel,
          { backgroundColor: theme.surface, borderColor: theme.border },
        ]}
      >
        <Text
          style={[
            listState.hasErrors ? styles.errorText : styles.statusText,
            {
              color: listState.hasErrors ? theme.danger : theme.secondaryText,
            },
          ]}
        >
          {listState.statusLabel}
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
