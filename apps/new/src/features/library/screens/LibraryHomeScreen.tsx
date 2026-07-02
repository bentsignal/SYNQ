import { useState } from "react";
import { Link } from "expo-router";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { useCustomizationTheme } from "@/src/features/settings/hooks/use-customization-theme";
import { LibraryCollectionPreviewSection } from "../components/LibraryCollectionPreviewSection";
import { LibrarySongPreviewList } from "../components/LibrarySongPreviewList";
import { LibrarySummaryGrid } from "../components/LibrarySummaryGrid";
import { useLibraryCollectionPreviewQuery } from "../hooks/use-library-collection-preview-query";
import {
  useLibrarySongPreviewQuery,
  type LibrarySongPreviewOrder,
  type LibrarySongPreviewSort,
} from "../hooks/use-library-song-preview-query";
import { useLibrarySummaryQuery } from "../hooks/use-library-summary-query";

export function LibraryHomeScreen() {
  const theme = useCustomizationTheme();
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState<LibrarySongPreviewSort>("recent");
  const [order, setOrder] = useState<LibrarySongPreviewOrder>("desc");
  const summary = useLibrarySummaryQuery();
  const collectionPreview = useLibraryCollectionPreviewQuery();
  const songPreview = useLibrarySongPreviewQuery({ order, query, sort });
  const hasErrors =
    summary.errors.length > 0 ||
    collectionPreview.errors.length > 0 ||
    Boolean(songPreview.error);
  const latestUpdate = Math.max(
    summary.updatedAt,
    collectionPreview.updatedAt,
    songPreview.updatedAt?.getTime() ?? 0,
  );
  const updatedLabel =
    latestUpdate > 0
      ? `Updated ${new Date(latestUpdate).toLocaleTimeString()}`
      : "Waiting for library data";

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
            href="/import"
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
          {hasErrors
            ? "One or more library queries failed."
            : updatedLabel}
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
