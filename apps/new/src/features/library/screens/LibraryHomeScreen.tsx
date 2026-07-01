import { useState } from "react";
import { Link } from "expo-router";
import { ScrollView, StyleSheet, Text, View } from "react-native";
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
    <ScrollView contentContainerStyle={styles.content} style={styles.screen}>
      <View style={styles.header}>
        <Text style={styles.kicker}>src/features/library</Text>
        <Text style={styles.title}>Library</Text>
        <Text style={styles.subtitle}>
          Reactive Drizzle library surface wired to the shared SYNQ database.
        </Text>
        <View style={styles.createLinks}>
          <Link href="/(tabs)/library/playlist/create" style={styles.createLink}>
            Create playlist
          </Link>
          <Link href="/(tabs)/library/album/create" style={styles.createLink}>
            Create album
          </Link>
          <Link href="/(tabs)/library/artist/create" style={styles.createLink}>
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

      <View style={styles.panel}>
        <Text style={hasErrors ? styles.errorText : styles.panelText}>
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
    backgroundColor: "#f4f7f5",
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
    color: "#0f766e",
    fontSize: 13,
    fontWeight: "800",
    letterSpacing: 0,
    textTransform: "uppercase",
  },
  title: {
    color: "#121417",
    fontSize: 34,
    fontWeight: "800",
    letterSpacing: 0,
    lineHeight: 40,
  },
  subtitle: {
    color: "#52605a",
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
    color: "#0f766e",
    fontSize: 14,
    fontWeight: "800",
    letterSpacing: 0,
    textTransform: "uppercase",
  },
  panel: {
    backgroundColor: "#ffffff",
    borderColor: "#dbe3de",
    borderRadius: 8,
    borderWidth: 1,
    padding: 16,
  },
  panelText: {
    color: "#52605a",
    fontSize: 14,
    lineHeight: 20,
  },
  errorText: {
    color: "#b42318",
    fontSize: 14,
    fontWeight: "700",
    lineHeight: 20,
  },
});
