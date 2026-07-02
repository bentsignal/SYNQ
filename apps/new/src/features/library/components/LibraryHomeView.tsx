import { Link } from "expo-router";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { useCustomizationTheme } from "@/src/features/settings/hooks/use-customization-theme";
import type { LibraryHomeController } from "../hooks/use-library-home-controller";
import { LibraryCollectionPreviewSection } from "./LibraryCollectionPreviewSection";
import { LibrarySongPreviewList } from "./LibrarySongPreviewList";
import { LibrarySummaryGrid } from "./LibrarySummaryGrid";

type LibraryHomeViewProps = LibraryHomeController;

export function LibraryHomeView({
  collectionPreview,
  hasErrors,
  order,
  query,
  setOrder,
  setQuery,
  setSort,
  songPreview,
  sort,
  summary,
  updatedLabel,
}: LibraryHomeViewProps) {
  const theme = useCustomizationTheme();

  return (
    <ScrollView
      contentContainerStyle={styles.content}
      style={[styles.screen, { backgroundColor: theme.background }]}
    >
      <View style={styles.header}>
        <Text style={[styles.kicker, { color: theme.accent }]}>
          Music Library
        </Text>
        <Text style={[styles.title, { color: theme.primaryText }]}>
          Library
        </Text>
        <Text style={[styles.subtitle, { color: theme.secondaryText }]}>
          Browse your songs, playlists, albums, and artists as your collection
          grows.
        </Text>
        <View style={styles.createLinks}>
          <Link
            href="/(tabs)/import"
            style={[styles.createLink, { color: theme.accent }]}
          >
            Import music
          </Link>
          <Link
            href="/(tabs)/library/playlist/create"
            style={[styles.createLink, { color: theme.accent }]}
          >
            Create playlist
          </Link>
          <Link
            href="/(tabs)/library/album/create"
            style={[styles.createLink, { color: theme.accent }]}
          >
            Create album
          </Link>
          <Link
            href="/(tabs)/library/artist/create"
            style={[styles.createLink, { color: theme.accent }]}
          >
            Create artist
          </Link>
        </View>
      </View>

      <LibrarySummaryGrid counts={summary.counts} />

      <LibrarySongPreviewList
        isEmpty={songPreview.isEmpty}
        order={order}
        query={query}
        setOrder={setOrder}
        setQuery={setQuery}
        setSort={setSort}
        songs={songPreview.songs}
        sort={sort}
      />

      <LibraryCollectionPreviewSection
        collections={collectionPreview.collections}
        isEmpty={collectionPreview.isEmpty}
        totals={collectionPreview.totals}
      />

      <View
        style={[
          styles.panel,
          { backgroundColor: theme.surface, borderColor: theme.border },
        ]}
      >
        <Text
          style={[
            hasErrors ? styles.errorText : styles.panelText,
            { color: hasErrors ? theme.danger : theme.secondaryText },
          ]}
        >
          {hasErrors ? "One or more library queries failed." : updatedLabel}
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
    gap: 20,
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
  subtitle: {
    fontSize: 15,
    lineHeight: 22,
    maxWidth: 460,
  },
  createLinks: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  createLink: {
    fontSize: 14,
    fontWeight: "800",
    letterSpacing: 0,
    textTransform: "uppercase",
  },
  panel: {
    borderRadius: 8,
    borderWidth: 1,
    padding: 16,
  },
  panelText: {
    fontSize: 14,
    lineHeight: 20,
  },
  errorText: {
    fontSize: 14,
    fontWeight: "700",
    lineHeight: 20,
  },
});
