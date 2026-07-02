import { Link, router, useLocalSearchParams } from "expo-router";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { usePlaybackSession } from "@/src/features/playback/hooks/use-playback-session";
import { useLibrarySongDetailQuery } from "../hooks/use-library-song-detail-query";

const parseId = (value: string | string[] | undefined) => {
  const rawValue = Array.isArray(value) ? value[0] : value;
  const id = Number(rawValue);

  return Number.isFinite(id) ? id : null;
};

export function LibrarySongDetailScreen() {
  const params = useLocalSearchParams<{ id?: string }>();
  const id = parseId(params.id);

  if (id === null) {
    return (
      <View style={styles.screen}>
        <Text style={styles.kicker}>Song</Text>
        <Text style={styles.title}>Invalid song</Text>
        <Text style={styles.subtitle}>This route needs a numeric id.</Text>
        <Link href="/(tabs)/library" style={styles.backLink}>
          Back to Library
        </Link>
      </View>
    );
  }

  return <LibrarySongDetailContent songId={id} />;
}

function LibrarySongDetailContent({ songId }: { songId: number }) {
  const { detail, errors } = useLibrarySongDetailQuery(songId);
  const { addToQueue, playSong } = usePlaybackSession();
  const hasErrors = errors.length > 0;
  const canPlay = !detail.isMissing && detail.pathToFile !== null;
  const updatedLabel =
    detail.updatedAt > 0
      ? `Updated ${new Date(detail.updatedAt).toLocaleTimeString()}`
      : "Waiting for song data";

  return (
    <ScrollView contentContainerStyle={styles.content} style={styles.scroll}>
      <View style={styles.header}>
        <Text style={styles.kicker}>Song</Text>
        <Text style={styles.title}>{detail.title}</Text>
        <Text style={styles.subtitle}>{detail.relationshipSummary}</Text>
      </View>

      <View style={styles.summaryGrid}>
        <View style={styles.summaryPanel}>
          <Text style={styles.summaryValue}>{detail.durationLabel}</Text>
          <Text style={styles.summaryLabel}>Duration</Text>
        </View>
        <View style={styles.summaryPanel}>
          <Text style={styles.summaryValue}>{detail.fileType}</Text>
          <Text style={styles.summaryLabel}>File type</Text>
        </View>
      </View>

      <View style={styles.actionRow}>
        <Pressable
          accessibilityRole="button"
          disabled={!canPlay}
          onPress={() => {
            playSong({
              album: detail.albumLabel,
              artist: detail.artistLabel,
              duration: detail.duration,
              id: songId,
              pathToFile: detail.pathToFile,
              title: detail.title,
            });
            router.push("/player");
          }}
          style={[styles.primaryButton, !canPlay ? styles.disabled : null]}
        >
          <Text style={styles.primaryButtonText}>Play</Text>
        </Pressable>
        <Pressable
          accessibilityRole="button"
          disabled={!canPlay}
          onPress={() => {
            addToQueue({
              album: detail.albumLabel,
              artist: detail.artistLabel,
              duration: detail.duration,
              id: songId,
              pathToFile: detail.pathToFile,
              title: detail.title,
            });
          }}
          style={[styles.secondaryButton, !canPlay ? styles.disabled : null]}
        >
          <Text style={styles.secondaryButtonText}>Add to queue</Text>
        </Pressable>
      </View>

      <RelationshipSection
        emptyLabel="No artists linked"
        items={detail.artists}
        title="Artists"
      />
      <RelationshipSection
        emptyLabel="No albums linked"
        items={detail.albums.map((album) => ({
          detail:
            album.track !== null
              ? `${album.detail} / track ${album.track}`
              : album.detail,
          id: album.id,
          title: album.title,
        }))}
        title="Albums"
      />
      <RelationshipSection
        emptyLabel="No playlists linked"
        items={detail.playlists}
        title="Playlists"
      />

      <View style={styles.panel}>
        <Text style={styles.panelLabel}>Source</Text>
        <Text style={styles.panelText}>{detail.originalFileName}</Text>
        <Text style={styles.pathText}>
          {detail.pathToFile ?? "No file path recorded"}
        </Text>
      </View>

      <View style={styles.panel}>
        <Text style={hasErrors ? styles.errorText : styles.panelText}>
          {hasErrors
            ? "One or more song detail queries failed."
            : detail.isMissing
              ? "Song missing from database."
              : !canPlay
                ? "Song has no playable file path."
              : updatedLabel}
        </Text>
      </View>

      <Link href="/(tabs)/library" style={styles.backLink}>
        Back to Library
      </Link>
    </ScrollView>
  );
}

function RelationshipSection({
  emptyLabel,
  items,
  title,
}: {
  emptyLabel: string;
  items: { detail?: string; id: number; title: string }[];
  title: string;
}) {
  return (
    <View style={styles.relationshipSection}>
      <Text style={styles.sectionTitle}>{title}</Text>
      <View style={styles.relationshipList}>
        {items.length === 0 ? (
          <Text style={styles.emptyRelationship}>{emptyLabel}</Text>
        ) : (
          items.map((item) => (
            <View key={item.id} style={styles.relationshipRow}>
              <Text numberOfLines={1} style={styles.relationshipTitle}>
                {item.title}
              </Text>
              {item.detail ? (
                <Text style={styles.relationshipDetail}>{item.detail}</Text>
              ) : null}
            </View>
          ))
        )}
      </View>
    </View>
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
  summaryGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  actionRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  primaryButton: {
    alignItems: "center",
    backgroundColor: "#0f766e",
    borderRadius: 8,
    flexGrow: 1,
    justifyContent: "center",
    minHeight: 44,
    minWidth: 112,
    paddingHorizontal: 14,
  },
  secondaryButton: {
    alignItems: "center",
    backgroundColor: "#ffffff",
    borderColor: "#dbe3de",
    borderRadius: 8,
    borderWidth: 1,
    flexGrow: 1,
    justifyContent: "center",
    minHeight: 44,
    minWidth: 132,
    paddingHorizontal: 14,
  },
  disabled: {
    opacity: 0.45,
  },
  primaryButtonText: {
    color: "#ffffff",
    fontSize: 13,
    fontWeight: "800",
    letterSpacing: 0,
    textTransform: "uppercase",
  },
  secondaryButtonText: {
    color: "#0f766e",
    fontSize: 13,
    fontWeight: "800",
    letterSpacing: 0,
    textTransform: "uppercase",
  },
  summaryPanel: {
    backgroundColor: "#ffffff",
    borderColor: "#dbe3de",
    borderRadius: 8,
    borderWidth: 1,
    flexBasis: "47%",
    flexGrow: 1,
    gap: 6,
    minHeight: 92,
    minWidth: 140,
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
  relationshipSection: {
    gap: 10,
  },
  sectionTitle: {
    color: "#121417",
    fontSize: 20,
    fontWeight: "800",
    letterSpacing: 0,
    lineHeight: 25,
  },
  relationshipList: {
    backgroundColor: "#ffffff",
    borderColor: "#dbe3de",
    borderRadius: 8,
    borderWidth: 1,
    overflow: "hidden",
  },
  relationshipRow: {
    alignItems: "center",
    borderBottomColor: "#edf2ef",
    borderBottomWidth: 1,
    flexDirection: "row",
    gap: 12,
    minHeight: 54,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  relationshipTitle: {
    color: "#121417",
    flex: 1,
    fontSize: 15,
    fontWeight: "800",
    letterSpacing: 0,
    lineHeight: 20,
  },
  relationshipDetail: {
    color: "#52605a",
    fontSize: 12,
    fontWeight: "800",
    letterSpacing: 0,
    maxWidth: 140,
    textAlign: "right",
  },
  emptyRelationship: {
    color: "#74807a",
    fontSize: 14,
    fontStyle: "italic",
    lineHeight: 20,
    padding: 14,
  },
  panel: {
    backgroundColor: "#ffffff",
    borderColor: "#dbe3de",
    borderRadius: 8,
    borderWidth: 1,
    gap: 8,
    padding: 16,
  },
  panelLabel: {
    color: "#52605a",
    fontSize: 12,
    fontWeight: "800",
    letterSpacing: 0,
    textTransform: "uppercase",
  },
  panelText: {
    color: "#52605a",
    fontSize: 14,
    lineHeight: 20,
  },
  pathText: {
    color: "#74807a",
    fontSize: 12,
    lineHeight: 18,
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
