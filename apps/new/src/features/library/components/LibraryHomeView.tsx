import { Link } from "expo-router";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { useCustomizationTheme } from "@/src/features/settings/hooks/use-customization-theme";
import type { LibraryHomeController } from "../hooks/use-library-home-controller";
import { getLibraryHomeHeaderState } from "../services/library-home-service";
import { LibraryCollectionPreviewSection } from "./LibraryCollectionPreviewSection";
import { LibrarySongPreviewList } from "./LibrarySongPreviewList";
import { LibrarySummaryGrid } from "./LibrarySummaryGrid";

type LibraryHomeViewProps = LibraryHomeController;

export function LibraryHomeView({
  collectionPreview,
  order,
  query,
  setOrder,
  setQuery,
  setSort,
  songPreview,
  sort,
  statusState,
  summary,
}: LibraryHomeViewProps) {
  const theme = useCustomizationTheme();
  const headerState = getLibraryHomeHeaderState();

  return (
    <ScrollView
      contentContainerStyle={styles.content}
      style={[styles.screen, { backgroundColor: theme.background }]}
    >
      <View style={styles.header}>
        <Text style={[styles.kicker, { color: theme.accent }]}>
          {headerState.kicker}
        </Text>
        <Text style={[styles.title, { color: theme.primaryText }]}>
          {headerState.title}
        </Text>
        <Text style={[styles.subtitle, { color: theme.secondaryText }]}>
          {headerState.subtitle}
        </Text>
        <View style={styles.createLinks}>
          {headerState.actions.map((action) => (
            <Link
              href={action.href}
              key={action.href}
              style={[styles.createLink, { color: theme.accent }]}
            >
              {action.label}
            </Link>
          ))}
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
            statusState.isError ? styles.errorText : styles.panelText,
            {
              color: statusState.isError ? theme.danger : theme.secondaryText,
            },
          ]}
        >
          {statusState.statusLabel}
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
