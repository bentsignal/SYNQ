import { Link, useLocalSearchParams } from "expo-router";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { parseNumericRouteParam } from "@/src/features/app-shell/services/route-param-service";
import { useCustomizationTheme } from "@/src/features/settings/hooks/use-customization-theme";
import { useLibrarySongDetailController } from "../hooks/use-library-song-detail-controller";
import { useLibrarySongDetailQuery } from "../hooks/use-library-song-detail-query";
import {
  getLibrarySongRelationshipHref,
  type LibrarySongRelationshipKind,
} from "../services/library-song-detail-service";

export function LibrarySongDetailScreen() {
  const params = useLocalSearchParams<{ id?: string }>();
  const theme = useCustomizationTheme();
  const id = parseNumericRouteParam(params.id);

  if (id === null) {
    return (
      <View style={[styles.screen, { backgroundColor: theme.background }]}>
        <Text style={[styles.kicker, { color: theme.accent }]}>Song</Text>
        <Text style={[styles.title, { color: theme.primaryText }]}>
          Invalid song
        </Text>
        <Text style={[styles.subtitle, { color: theme.secondaryText }]}>
          This route needs a numeric id.
        </Text>
        <Link
          href="/(tabs)/library"
          style={[styles.backLink, { color: theme.accent }]}
        >
          Back to Library
        </Link>
      </View>
    );
  }

  return <LibrarySongDetailContent songId={id} />;
}

function LibrarySongDetailContent({ songId }: { songId: number }) {
  const { detail, errors } = useLibrarySongDetailQuery(songId);
  const theme = useCustomizationTheme();
  const hasErrors = errors.length > 0;
  const {
    actionState,
    deleteCurrentSong,
    error,
    exportCurrentSong,
    playCurrentSong,
    queueCurrentSong,
    toggleLiked,
  } = useLibrarySongDetailController({
    detail,
    songId,
  });
  const updatedLabel =
    detail.updatedAt > 0
      ? `Updated ${new Date(detail.updatedAt).toLocaleTimeString()}`
      : "Waiting for song data";

  return (
    <ScrollView
      contentContainerStyle={styles.content}
      style={[styles.scroll, { backgroundColor: theme.background }]}
    >
      <View style={styles.header}>
        <Text style={[styles.kicker, { color: theme.accent }]}>Song</Text>
        <Text style={[styles.title, { color: theme.primaryText }]}>
          {detail.title}
        </Text>
        <Text style={[styles.subtitle, { color: theme.secondaryText }]}>
          {detail.relationshipSummary}
        </Text>
      </View>

      <View style={styles.summaryGrid}>
        <View
          style={[
            styles.summaryPanel,
            { backgroundColor: theme.surface, borderColor: theme.border },
          ]}
        >
          <Text style={[styles.summaryValue, { color: theme.primaryText }]}>
            {detail.durationLabel}
          </Text>
          <Text style={[styles.summaryLabel, { color: theme.secondaryText }]}>
            Duration
          </Text>
        </View>
        <View
          style={[
            styles.summaryPanel,
            { backgroundColor: theme.surface, borderColor: theme.border },
          ]}
        >
          <Text style={[styles.summaryValue, { color: theme.primaryText }]}>
            {detail.fileType}
          </Text>
          <Text style={[styles.summaryLabel, { color: theme.secondaryText }]}>
            File type
          </Text>
        </View>
      </View>

      <View style={styles.actionRow}>
        <Pressable
          accessibilityRole="button"
          disabled={!actionState.canPlay}
          onPress={playCurrentSong}
          style={[
            styles.primaryButton,
            { backgroundColor: theme.accent },
            !actionState.canPlay ? styles.disabled : null,
          ]}
        >
          <Text style={[styles.primaryButtonText, { color: theme.onAccent }]}>
            Play
          </Text>
        </Pressable>
        <Pressable
          accessibilityRole="button"
          disabled={!actionState.canPlay}
          onPress={queueCurrentSong}
          style={[
            styles.secondaryButton,
            { backgroundColor: theme.surface, borderColor: theme.border },
            !actionState.canPlay ? styles.disabled : null,
          ]}
        >
          <Text style={[styles.secondaryButtonText, { color: theme.accent }]}>
            Add to queue
          </Text>
        </Pressable>
        <Pressable
          accessibilityRole="button"
          disabled={!actionState.canToggleLiked}
          onPress={toggleLiked}
          style={[
            styles.secondaryButton,
            { backgroundColor: theme.surface, borderColor: theme.border },
            !actionState.canToggleLiked ? styles.disabled : null,
          ]}
        >
          <Text style={[styles.secondaryButtonText, { color: theme.accent }]}>
            {actionState.likedLabel}
          </Text>
        </Pressable>
        <Link
          href={`/(tabs)/library/song/edit/${songId}`}
          style={[
            styles.secondaryButton,
            {
              backgroundColor: theme.surface,
              borderColor: theme.border,
              color: theme.accent,
            },
          ]}
        >
          Edit
        </Link>
        <Pressable
          accessibilityRole="button"
          disabled={!actionState.canExport}
          onPress={exportCurrentSong}
          style={[
            styles.secondaryButton,
            { backgroundColor: theme.surface, borderColor: theme.border },
            !actionState.canExport ? styles.disabled : null,
          ]}
        >
          <Text style={[styles.secondaryButtonText, { color: theme.accent }]}>
            {actionState.exportLabel}
          </Text>
        </Pressable>
        <Pressable
          accessibilityRole="button"
          disabled={!actionState.canDelete}
          onPress={deleteCurrentSong}
          style={[
            styles.dangerButton,
            { backgroundColor: theme.surface, borderColor: theme.danger },
            !actionState.canDelete ? styles.disabled : null,
          ]}
        >
          <Text style={[styles.secondaryButtonText, { color: theme.danger }]}>
            {actionState.deleteLabel}
          </Text>
        </Pressable>
      </View>

      <RelationshipSection
        emptyLabel="No artists linked"
        items={detail.artists}
        kind="artist"
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
        kind="album"
        title="Albums"
      />
      <RelationshipSection
        emptyLabel="No playlists linked"
        items={detail.playlists}
        kind="playlist"
        title="Playlists"
      />

      <View
        style={[
          styles.panel,
          { backgroundColor: theme.surface, borderColor: theme.border },
        ]}
      >
        <Text style={[styles.panelLabel, { color: theme.secondaryText }]}>
          Source
        </Text>
        <Text style={[styles.panelText, { color: theme.secondaryText }]}>
          {detail.originalFileName}
        </Text>
        <Text style={[styles.pathText, { color: theme.mutedText }]}>
          {detail.pathToFile ?? "No file path recorded"}
        </Text>
      </View>

      <View
        style={[
          styles.panel,
          { backgroundColor: theme.surface, borderColor: theme.border },
        ]}
      >
        <Text
          style={[
            hasErrors || error ? styles.errorText : styles.panelText,
            {
              color: hasErrors || error
                ? theme.danger
                : theme.secondaryText,
            },
          ]}
        >
          {error ??
            (hasErrors
              ? "One or more song detail queries failed."
              : detail.isMissing
                ? "Song missing from database."
                : !actionState.canPlay
                  ? "Song has no playable file path."
                  : updatedLabel)}
        </Text>
      </View>

      <Link
        href="/(tabs)/library"
        style={[styles.backLink, { color: theme.accent }]}
      >
        Back to Library
      </Link>
    </ScrollView>
  );
}

function RelationshipSection({
  emptyLabel,
  items,
  kind,
  title,
}: {
  emptyLabel: string;
  items: { detail?: string; id: number; title: string }[];
  kind: LibrarySongRelationshipKind;
  title: string;
}) {
  const theme = useCustomizationTheme();

  return (
    <View style={styles.relationshipSection}>
      <Text style={[styles.sectionTitle, { color: theme.primaryText }]}>
        {title}
      </Text>
      <View
        style={[
          styles.relationshipList,
          { backgroundColor: theme.surface, borderColor: theme.border },
        ]}
      >
        {items.length === 0 ? (
          <Text style={[styles.emptyRelationship, { color: theme.mutedText }]}>
            {emptyLabel}
          </Text>
        ) : (
          items.map((item) => (
            <Link
              asChild
              href={getLibrarySongRelationshipHref({ id: item.id, kind })}
              key={item.id}
            >
              <Pressable
                style={[
                  styles.relationshipRow,
                  { borderBottomColor: theme.borderSubtle },
                ]}
              >
                <Text
                  numberOfLines={1}
                  style={[
                    styles.relationshipTitle,
                    { color: theme.primaryText },
                  ]}
                >
                  {item.title}
                </Text>
                {item.detail ? (
                  <Text
                    style={[
                      styles.relationshipDetail,
                      { color: theme.secondaryText },
                    ]}
                  >
                    {item.detail}
                  </Text>
                ) : null}
              </Pressable>
            </Link>
          ))
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  scroll: {
    flex: 1,
  },
  screen: {
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
    borderRadius: 8,
    flexGrow: 1,
    justifyContent: "center",
    minHeight: 44,
    minWidth: 112,
    paddingHorizontal: 14,
  },
  secondaryButton: {
    alignItems: "center",
    borderRadius: 8,
    borderWidth: 1,
    flexGrow: 1,
    justifyContent: "center",
    minHeight: 44,
    minWidth: 132,
    paddingHorizontal: 14,
  },
  dangerButton: {
    alignItems: "center",
    borderRadius: 8,
    borderWidth: 1,
    flexGrow: 1,
    justifyContent: "center",
    minHeight: 44,
    minWidth: 112,
    paddingHorizontal: 14,
  },
  disabled: {
    opacity: 0.45,
  },
  primaryButtonText: {
    fontSize: 13,
    fontWeight: "800",
    letterSpacing: 0,
    textTransform: "uppercase",
  },
  secondaryButtonText: {
    fontSize: 13,
    fontWeight: "800",
    letterSpacing: 0,
    textTransform: "uppercase",
  },
  summaryPanel: {
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
    fontSize: 22,
    fontWeight: "800",
    letterSpacing: 0,
    lineHeight: 28,
  },
  summaryLabel: {
    fontSize: 13,
    fontWeight: "700",
    lineHeight: 18,
  },
  relationshipSection: {
    gap: 10,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "800",
    letterSpacing: 0,
    lineHeight: 25,
  },
  relationshipList: {
    borderRadius: 8,
    borderWidth: 1,
    overflow: "hidden",
  },
  relationshipRow: {
    alignItems: "center",
    borderBottomWidth: 1,
    flexDirection: "row",
    gap: 12,
    minHeight: 54,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  relationshipTitle: {
    flex: 1,
    fontSize: 15,
    fontWeight: "800",
    letterSpacing: 0,
    lineHeight: 20,
  },
  relationshipDetail: {
    fontSize: 12,
    fontWeight: "800",
    letterSpacing: 0,
    maxWidth: 140,
    textAlign: "right",
  },
  emptyRelationship: {
    fontSize: 14,
    fontStyle: "italic",
    lineHeight: 20,
    padding: 14,
  },
  panel: {
    borderRadius: 8,
    borderWidth: 1,
    gap: 8,
    padding: 16,
  },
  panelLabel: {
    fontSize: 12,
    fontWeight: "800",
    letterSpacing: 0,
    textTransform: "uppercase",
  },
  panelText: {
    fontSize: 14,
    lineHeight: 20,
  },
  pathText: {
    fontSize: 12,
    lineHeight: 18,
  },
  errorText: {
    fontSize: 14,
    fontWeight: "700",
    lineHeight: 20,
  },
  backLink: {
    fontSize: 15,
    fontWeight: "800",
    letterSpacing: 0,
  },
});
