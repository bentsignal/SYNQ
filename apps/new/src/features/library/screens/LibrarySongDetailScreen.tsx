import { useState } from "react";
import { Link, router, useLocalSearchParams } from "expo-router";
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { shareLibrarySongs } from "@/src/features/export/services/library-export-service";
import { parseNumericRouteParam } from "@/src/features/app-shell/services/route-param-service";
import { usePlaybackSession } from "@/src/features/playback/hooks/use-playback-session";
import { useCustomizationTheme } from "@/src/features/settings/hooks/use-customization-theme";
import { useHapticFeedback } from "@/src/features/settings/hooks/use-haptic-feedback";
import { useLibrarySongDetailQuery } from "../hooks/use-library-song-detail-query";
import {
  deleteLibrarySong,
  setLibrarySongLiked,
} from "../repository/song-metadata-repository";
import {
  getLibrarySongDetailActionState,
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
  const { addToQueue, playSong } = usePlaybackSession();
  const { removeFromQueue } = usePlaybackSession();
  const theme = useCustomizationTheme();
  const { sendHaptic } = useHapticFeedback();
  const [isDeleting, setIsDeleting] = useState(false);
  const [exportError, setExportError] = useState<string | null>(null);
  const [isExporting, setIsExporting] = useState(false);
  const [isTogglingLiked, setIsTogglingLiked] = useState(false);
  const hasErrors = errors.length > 0;
  const { canDelete, canExport, canPlay, canToggleLiked } =
    getLibrarySongDetailActionState({
      detail,
      isDeleting,
      isExporting,
      isTogglingLiked,
    });
  const updatedLabel =
    detail.updatedAt > 0
      ? `Updated ${new Date(detail.updatedAt).toLocaleTimeString()}`
      : "Waiting for song data";
  const deleteSong = () => {
    Alert.alert("Delete song", `Delete ${detail.title}?`, [
      { text: "Cancel", style: "cancel" },
      {
        onPress: async () => {
          setIsDeleting(true);
          setExportError(null);

          try {
            await deleteLibrarySong(songId);
            removeFromQueue(songId);
            sendHaptic("success");
            router.replace("/(tabs)/library");
          } catch (error) {
            sendHaptic("error");
            setExportError(
              error instanceof Error
                ? error.message
                : "Song could not be deleted.",
            );
          } finally {
            setIsDeleting(false);
          }
        },
        style: "destructive",
        text: "Delete",
      },
    ]);
  };
  const toggleLiked = async () => {
    if (detail.isMissing) {
      sendHaptic("error");
      return;
    }

    setIsTogglingLiked(true);
    setExportError(null);

    try {
      await setLibrarySongLiked({
        liked: !detail.isLiked,
        songId,
      });
      sendHaptic("light");
    } catch (error) {
      sendHaptic("error");
      setExportError(
        error instanceof Error
          ? error.message
          : "Liked Songs could not be updated.",
      );
    } finally {
      setIsTogglingLiked(false);
    }
  };

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
          disabled={!canPlay}
          onPress={() => {
            sendHaptic("light");
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
          style={[
            styles.primaryButton,
            { backgroundColor: theme.accent },
            !canPlay ? styles.disabled : null,
          ]}
        >
          <Text style={[styles.primaryButtonText, { color: theme.onAccent }]}>
            Play
          </Text>
        </Pressable>
        <Pressable
          accessibilityRole="button"
          disabled={!canPlay}
          onPress={() => {
            sendHaptic("light");
            addToQueue({
              album: detail.albumLabel,
              artist: detail.artistLabel,
              duration: detail.duration,
              id: songId,
              pathToFile: detail.pathToFile,
              title: detail.title,
            });
          }}
          style={[
            styles.secondaryButton,
            { backgroundColor: theme.surface, borderColor: theme.border },
            !canPlay ? styles.disabled : null,
          ]}
        >
          <Text style={[styles.secondaryButtonText, { color: theme.accent }]}>
            Add to queue
          </Text>
        </Pressable>
        <Pressable
          accessibilityRole="button"
          disabled={!canToggleLiked}
          onPress={toggleLiked}
          style={[
            styles.secondaryButton,
            { backgroundColor: theme.surface, borderColor: theme.border },
            !canToggleLiked ? styles.disabled : null,
          ]}
        >
          <Text style={[styles.secondaryButtonText, { color: theme.accent }]}>
            {detail.isLiked ? "Unlike" : "Like"}
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
          disabled={!canExport}
          onPress={async () => {
            setExportError(null);
            setIsExporting(true);

            try {
              await shareLibrarySongs([
                {
                  id: songId,
                  pathToFile: detail.pathToFile,
                  title: detail.title,
                },
              ]);
              sendHaptic("success");
            } catch (error) {
              sendHaptic("error");
              setExportError(
                error instanceof Error
                  ? error.message
                  : "Song could not be exported.",
              );
            } finally {
              setIsExporting(false);
            }
          }}
          style={[
            styles.secondaryButton,
            { backgroundColor: theme.surface, borderColor: theme.border },
            !canExport ? styles.disabled : null,
          ]}
        >
          <Text style={[styles.secondaryButtonText, { color: theme.accent }]}>
            {isExporting ? "Exporting" : "Export"}
          </Text>
        </Pressable>
        <Pressable
          accessibilityRole="button"
          disabled={!canDelete}
          onPress={deleteSong}
          style={[
            styles.dangerButton,
            { backgroundColor: theme.surface, borderColor: theme.danger },
            !canDelete ? styles.disabled : null,
          ]}
        >
          <Text style={[styles.secondaryButtonText, { color: theme.danger }]}>
            {isDeleting ? "Deleting" : "Delete"}
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
            hasErrors || exportError ? styles.errorText : styles.panelText,
            {
              color: hasErrors || exportError
                ? theme.danger
                : theme.secondaryText,
            },
          ]}
        >
          {exportError ??
            (hasErrors
              ? "One or more song detail queries failed."
              : detail.isMissing
                ? "Song missing from database."
                : !canPlay
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
