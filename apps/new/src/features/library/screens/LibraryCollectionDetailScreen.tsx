import { Link, useLocalSearchParams } from "expo-router";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { LibraryCollectionSongList } from "../components/LibraryCollectionSongList";
import {
  useLibraryCollectionDetailQuery,
  type LibraryCollectionDetailKind,
} from "../hooks/use-library-collection-detail-query";

type LibraryCollectionDetailScreenProps = {
  kind: LibraryCollectionDetailKind;
};

const parseId = (value: string | string[] | undefined) => {
  const rawValue = Array.isArray(value) ? value[0] : value;
  const id = Number(rawValue);

  return Number.isFinite(id) ? id : null;
};

export function LibraryCollectionDetailScreen({
  kind,
}: LibraryCollectionDetailScreenProps) {
  const params = useLocalSearchParams<{ id?: string }>();
  const id = parseId(params.id);

  if (id === null) {
    return (
      <View style={styles.screen}>
        <Text style={styles.kicker}>src/features/library</Text>
        <Text style={styles.title}>Invalid collection</Text>
        <Text style={styles.subtitle}>This route needs a numeric id.</Text>
        <Link href="/(tabs)/library" style={styles.backLink}>
          Back to Library
        </Link>
      </View>
    );
  }

  return <LibraryCollectionDetailContent id={id} kind={kind} />;
}

function LibraryCollectionDetailContent({
  id,
  kind,
}: {
  id: number;
  kind: LibraryCollectionDetailKind;
}) {
  const { detail, errors } = useLibraryCollectionDetailQuery({ id, kind });
  const hasErrors = errors.length > 0;
  const updatedLabel =
    detail.updatedAt > 0
      ? `Updated ${new Date(detail.updatedAt).toLocaleTimeString()}`
      : "Waiting for collection data";

  return (
    <ScrollView contentContainerStyle={styles.content} style={styles.scroll}>
      <View style={styles.header}>
        <Text style={styles.kicker}>{detail.eyebrow}</Text>
        <Text style={styles.title}>{detail.title}</Text>
        <Text style={styles.subtitle}>{detail.meta}</Text>
      </View>

      <View style={styles.summaryPanel}>
        <Text style={styles.summaryValue}>{detail.detail}</Text>
        <Text style={styles.summaryLabel}>
          {detail.isMissing ? "Missing from database" : updatedLabel}
        </Text>
      </View>

      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Songs</Text>
        <Text style={styles.sectionMeta}>Reactive query</Text>
      </View>

      <LibraryCollectionSongList songs={detail.songs} />

      <View style={styles.panel}>
        <Text style={hasErrors ? styles.errorText : styles.panelText}>
          {hasErrors ? "One or more detail queries failed." : updatedLabel}
        </Text>
      </View>

      <Link href="/(tabs)/library" style={styles.backLink}>
        Back to Library
      </Link>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: {
    backgroundColor: "#f4f7f5",
    flex: 1,
  },
  screen: {
    backgroundColor: "#f4f7f5",
    flex: 1,
    gap: 10,
    paddingHorizontal: 20,
    paddingVertical: 56,
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
    maxWidth: 520,
  },
  summaryPanel: {
    backgroundColor: "#ffffff",
    borderColor: "#dbe3de",
    borderRadius: 8,
    borderWidth: 1,
    gap: 6,
    padding: 16,
  },
  summaryValue: {
    color: "#121417",
    fontSize: 22,
    fontWeight: "800",
    letterSpacing: 0,
    lineHeight: 28,
  },
  summaryLabel: {
    color: "#52605a",
    fontSize: 13,
    fontWeight: "700",
    lineHeight: 18,
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
  backLink: {
    color: "#0f766e",
    fontSize: 15,
    fontWeight: "800",
    letterSpacing: 0,
  },
});
