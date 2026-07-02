import { useState } from "react";
import { Link, router, useLocalSearchParams } from "expo-router";
import {
  Alert,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { shareLibrarySongs } from "@/src/features/export/services/library-export-service";
import { parseNumericRouteParam } from "@/src/features/app-shell/services/route-param-service";
import { usePlaybackSession } from "@/src/features/playback/hooks/use-playback-session";
import { useCustomizationTheme } from "@/src/features/settings/hooks/use-customization-theme";
import { useHapticFeedback } from "@/src/features/settings/hooks/use-haptic-feedback";
import { LibraryCollectionSongList } from "../components/LibraryCollectionSongList";
import {
  useAlbumCollectionDetailQuery,
  useArtistCollectionDetailQuery,
  usePlaylistCollectionDetailQuery,
  type LibraryCollectionDetailKind,
} from "../hooks/use-library-collection-detail-query";
import { deleteCollection } from "../repository/collection-repository";
import {
  removeSongFromCollection,
  updateCollectionSongOrder,
} from "../repository/relationship-repository";
import {
  getCollectionDetailActionState,
  getCollectionListHref,
  reorderCollectionSongs,
} from "../services/library-collection-interaction-service";

type LibraryCollectionDetailScreenProps = {
  kind: LibraryCollectionDetailKind;
};

export function LibraryCollectionDetailScreen({
  kind,
}: LibraryCollectionDetailScreenProps) {
  const params = useLocalSearchParams<{ id?: string }>();
  const theme = useCustomizationTheme();
  const id = parseNumericRouteParam(params.id);

  if (id === null) {
    return (
      <View style={[styles.screen, { backgroundColor: theme.background }]}>
        <Text style={[styles.kicker, { color: theme.accent }]}>
          Library
        </Text>
        <Text style={[styles.title, { color: theme.primaryText }]}>
          Invalid collection
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

  return <LibraryCollectionDetailContent id={id} kind={kind} />;
}

function LibraryCollectionDetailContent({
  id,
  kind,
}: {
  id: number;
  kind: LibraryCollectionDetailKind;
}) {
  if (kind === "album") {
    return <AlbumCollectionDetailContent id={id} />;
  }

  if (kind === "artist") {
    return <ArtistCollectionDetailContent id={id} />;
  }

  return <PlaylistCollectionDetailContent id={id} />;
}

function AlbumCollectionDetailContent({ id }: { id: number }) {
  const collection = useAlbumCollectionDetailQuery({ id });

  return (
    <LibraryCollectionDetailView collection={collection} id={id} kind="album" />
  );
}

function ArtistCollectionDetailContent({ id }: { id: number }) {
  const collection = useArtistCollectionDetailQuery({ id });

  return (
    <LibraryCollectionDetailView collection={collection} id={id} kind="artist" />
  );
}

function PlaylistCollectionDetailContent({ id }: { id: number }) {
  const collection = usePlaylistCollectionDetailQuery({ id });

  return (
    <LibraryCollectionDetailView
      collection={collection}
      id={id}
      kind="playlist"
    />
  );
}

type LibraryCollectionDetailViewProps = {
  collection: ReturnType<typeof useAlbumCollectionDetailQuery>;
  id: number;
  kind: LibraryCollectionDetailKind;
};

function LibraryCollectionDetailView({
  collection,
  id,
  kind,
}: LibraryCollectionDetailViewProps) {
  const { detail, errors } = collection;
  const { addToQueue, playSong } = usePlaybackSession();
  const theme = useCustomizationTheme();
  const { sendHaptic } = useHapticFeedback();
  const [movingSongId, setMovingSongId] = useState<number | null>(null);
  const [removingSongId, setRemovingSongId] = useState<number | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [mutationError, setMutationError] = useState<string | null>(null);
  const hasErrors = errors.length > 0;
  const updatedLabel =
    detail.updatedAt > 0
      ? `Updated ${new Date(detail.updatedAt).toLocaleTimeString()}`
      : "Waiting for collection data";
  const actionState = getCollectionDetailActionState({
    id,
    isDeleting,
    isExporting,
    isMissing: detail.isMissing,
    kind,
    songs: detail.songs,
  });
  const playCollection = () => {
    const [firstSong, ...queuedSongs] = actionState.playableSongs;

    if (!firstSong) {
      sendHaptic("error");
      return;
    }

    sendHaptic("light");
    playSong(firstSong);
    queuedSongs.forEach(addToQueue);
    router.push("/player");
  };
  const queueCollection = () => {
    if (!actionState.canQueue) {
      sendHaptic("error");
      return;
    }

    sendHaptic("light");
    actionState.playableSongs.forEach(addToQueue);
  };
  const exportCollection = async () => {
    if (!actionState.canExport) {
      sendHaptic("error");
      return;
    }

    setIsExporting(true);
    setMutationError(null);

    try {
      await shareLibrarySongs(actionState.playableSongs);
      sendHaptic("success");
    } catch (caughtError) {
      sendHaptic("error");
      setMutationError(
        caughtError instanceof Error
          ? caughtError.message
          : "Songs could not be exported.",
      );
    } finally {
      setIsExporting(false);
    }
  };
  const deleteCurrentCollection = () => {
    if (!actionState.canDelete) {
      sendHaptic("error");
      return;
    }

    Alert.alert(
      `Delete ${detail.eyebrow.toLowerCase()}`,
      `Delete ${detail.title}? Songs will stay in your library.`,
      [
        { style: "cancel", text: "Cancel" },
        {
          onPress: async () => {
            setIsDeleting(true);
            setMutationError(null);

            try {
              await deleteCollection({ id, kind });
              sendHaptic("success");
              router.replace(getCollectionListHref(kind));
            } catch (caughtError) {
              sendHaptic("error");
              setMutationError(
                caughtError instanceof Error
                  ? caughtError.message
                  : "Collection could not be deleted.",
              );
            } finally {
              setIsDeleting(false);
            }
          },
          style: "destructive",
          text: "Delete",
        },
      ],
    );
  };

  return (
    <ScrollView
      contentContainerStyle={styles.content}
      style={[styles.scroll, { backgroundColor: theme.background }]}
    >
      <View style={styles.header}>
        {detail.imagePath ? (
          <Image source={{ uri: detail.imagePath }} style={styles.heroImage} />
        ) : (
          <View
            style={[
              styles.heroPlaceholder,
              { backgroundColor: theme.surface, borderColor: theme.border },
            ]}
          >
            <Text style={[styles.heroInitial, { color: theme.accent }]}>
              {detail.title.slice(0, 1).toUpperCase()}
            </Text>
          </View>
        )}
        <Text style={[styles.kicker, { color: theme.accent }]}>
          {detail.eyebrow}
        </Text>
        <Text style={[styles.title, { color: theme.primaryText }]}>
          {detail.title}
        </Text>
        <Text style={[styles.subtitle, { color: theme.secondaryText }]}>
          {detail.meta}
        </Text>
      </View>

      <View
        style={[
          styles.summaryPanel,
          { backgroundColor: theme.surface, borderColor: theme.border },
        ]}
      >
        <Text style={[styles.summaryValue, { color: theme.primaryText }]}>
          {detail.detail}
        </Text>
        <Text style={[styles.summaryLabel, { color: theme.secondaryText }]}>
          {detail.isMissing ? "Collection not found" : updatedLabel}
        </Text>
      </View>

      <View style={styles.actionRow}>
        <Pressable
          accessibilityRole="button"
          disabled={!actionState.canPlay}
          onPress={playCollection}
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
          disabled={!actionState.canQueue}
          onPress={queueCollection}
          style={[
            styles.secondaryButton,
            { backgroundColor: theme.surface, borderColor: theme.border },
            !actionState.canQueue ? styles.disabled : null,
          ]}
        >
          <Text style={[styles.secondaryButtonText, { color: theme.accent }]}>
            Add to queue
          </Text>
        </Pressable>
        <Link
          href={`/(tabs)/library/${kind}/edit/${id}`}
          style={[styles.editLink, { color: theme.accent }]}
        >
          Edit {detail.eyebrow.toLowerCase()}
        </Link>
        <Link
          href={`/(tabs)/library/${kind}/add/${id}`}
          style={[styles.editLink, { color: theme.accent }]}
        >
          Add songs
        </Link>
        <Pressable
          accessibilityRole="button"
          disabled={!actionState.canExport}
          onPress={exportCollection}
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
          onPress={deleteCurrentCollection}
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

      <View style={styles.sectionHeader}>
        <Text style={[styles.sectionTitle, { color: theme.primaryText }]}>
          Songs
        </Text>
        <Text style={[styles.sectionMeta, { color: theme.secondaryText }]}>
          {detail.songs.length} songs
        </Text>
      </View>

      <LibraryCollectionSongList
        movingSongId={movingSongId}
        onMoveSong={async (songId, direction) => {
          setMovingSongId(songId);
          setMutationError(null);

          try {
            const reorderedSongs = reorderCollectionSongs({
              direction,
              songId,
              songs: detail.songs,
            });

            await updateCollectionSongOrder({
              collectionId: id,
              kind,
              songIds: reorderedSongs.map((song) => song.id),
            });
            sendHaptic("light");
          } catch (caughtError) {
            sendHaptic("error");
            setMutationError(
              caughtError instanceof Error
                ? caughtError.message
                : "Song order could not be saved.",
            );
          } finally {
            setMovingSongId(null);
          }
        }}
        onRemoveSong={async (songId) => {
          setRemovingSongId(songId);
          setMutationError(null);

          try {
            await removeSongFromCollection({
              collectionId: id,
              kind,
              songId,
            });
            sendHaptic("medium");
          } catch (caughtError) {
            sendHaptic("error");
            setMutationError(
              caughtError instanceof Error
                ? caughtError.message
                : "Song could not be removed.",
            );
          } finally {
            setRemovingSongId(null);
          }
        }}
        removingSongId={removingSongId}
        songs={detail.songs}
      />

      <View
        style={[
          styles.panel,
          { backgroundColor: theme.surface, borderColor: theme.border },
        ]}
      >
        <Text
          style={[
            hasErrors || mutationError ? styles.errorText : styles.panelText,
            {
              color:
                hasErrors || mutationError ? theme.danger : theme.secondaryText,
            },
          ]}
        >
          {mutationError ??
            (hasErrors ? "One or more detail queries failed." : updatedLabel)}
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
  heroImage: {
    borderRadius: 8,
    height: 132,
    width: 132,
  },
  heroPlaceholder: {
    alignItems: "center",
    borderRadius: 8,
    borderWidth: 1,
    height: 132,
    justifyContent: "center",
    width: 132,
  },
  heroInitial: {
    fontSize: 44,
    fontWeight: "800",
    letterSpacing: 0,
    lineHeight: 52,
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
  summaryPanel: {
    borderRadius: 8,
    borderWidth: 1,
    gap: 6,
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
  sectionHeader: {
    alignItems: "flex-end",
    flexDirection: "row",
    gap: 12,
    justifyContent: "space-between",
  },
  sectionTitle: {
    flex: 1,
    fontSize: 20,
    fontWeight: "800",
    letterSpacing: 0,
    lineHeight: 25,
  },
  sectionMeta: {
    fontSize: 12,
    fontWeight: "800",
    letterSpacing: 0,
    lineHeight: 17,
    textTransform: "uppercase",
  },
  actionRow: {
    alignItems: "center",
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  primaryButton: {
    alignItems: "center",
    borderRadius: 8,
    justifyContent: "center",
    minHeight: 44,
    minWidth: 112,
    paddingHorizontal: 16,
  },
  primaryButtonText: {
    fontSize: 13,
    fontWeight: "800",
    letterSpacing: 0,
    textTransform: "uppercase",
  },
  secondaryButton: {
    alignItems: "center",
    borderRadius: 8,
    borderWidth: 1,
    justifyContent: "center",
    minHeight: 44,
    minWidth: 132,
    paddingHorizontal: 16,
  },
  dangerButton: {
    alignItems: "center",
    borderRadius: 8,
    borderWidth: 1,
    justifyContent: "center",
    minHeight: 44,
    minWidth: 132,
    paddingHorizontal: 16,
  },
  secondaryButtonText: {
    fontSize: 13,
    fontWeight: "800",
    letterSpacing: 0,
    textTransform: "uppercase",
  },
  disabled: {
    opacity: 0.45,
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
  backLink: {
    fontSize: 15,
    fontWeight: "800",
    letterSpacing: 0,
  },
  editLink: {
    fontSize: 14,
    fontWeight: "800",
    letterSpacing: 0,
    textTransform: "uppercase",
  },
});
