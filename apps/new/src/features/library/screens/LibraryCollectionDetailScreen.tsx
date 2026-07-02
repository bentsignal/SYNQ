import { useState } from "react";
import { Link, useLocalSearchParams } from "expo-router";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { useCustomizationTheme } from "@/src/features/settings/hooks/use-customization-theme";
import { useHapticFeedback } from "@/src/features/settings/hooks/use-haptic-feedback";
import { LibraryCollectionSongList } from "../components/LibraryCollectionSongList";
import {
  useLibraryCollectionDetailQuery,
  type LibraryCollectionDetailSong,
  type LibraryCollectionDetailKind,
} from "../hooks/use-library-collection-detail-query";
import {
  removeSongFromCollection,
  updateAlbumSongOrder,
} from "../repository/relationship-repository";

type LibraryCollectionDetailScreenProps = {
  kind: LibraryCollectionDetailKind;
};

const parseId = (value: string | string[] | undefined) => {
  const rawValue = Array.isArray(value) ? value[0] : value;
  const id = Number(rawValue);

  return Number.isFinite(id) ? id : null;
};

const reorderSongs = ({
  direction,
  songId,
  songs,
}: {
  direction: "down" | "up";
  songId: number;
  songs: LibraryCollectionDetailSong[];
}) => {
  const fromIndex = songs.findIndex((song) => song.id === songId);

  if (fromIndex < 0) {
    return songs;
  }

  const toIndex = direction === "up" ? fromIndex - 1 : fromIndex + 1;

  if (toIndex < 0 || toIndex >= songs.length) {
    return songs;
  }

  const nextSongs = [...songs];
  const [movedSong] = nextSongs.splice(fromIndex, 1);
  nextSongs.splice(toIndex, 0, movedSong);

  return nextSongs;
};

export function LibraryCollectionDetailScreen({
  kind,
}: LibraryCollectionDetailScreenProps) {
  const params = useLocalSearchParams<{ id?: string }>();
  const theme = useCustomizationTheme();
  const id = parseId(params.id);

  if (id === null) {
    return (
      <View style={[styles.screen, { backgroundColor: theme.background }]}>
        <Text style={[styles.kicker, { color: theme.accent }]}>
          src/features/library
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
  const { detail, errors } = useLibraryCollectionDetailQuery({ id, kind });
  const theme = useCustomizationTheme();
  const { sendHaptic } = useHapticFeedback();
  const [movingSongId, setMovingSongId] = useState<number | null>(null);
  const [removingSongId, setRemovingSongId] = useState<number | null>(null);
  const [mutationError, setMutationError] = useState<string | null>(null);
  const hasErrors = errors.length > 0;
  const updatedLabel =
    detail.updatedAt > 0
      ? `Updated ${new Date(detail.updatedAt).toLocaleTimeString()}`
      : "Waiting for collection data";

  return (
    <ScrollView
      contentContainerStyle={styles.content}
      style={[styles.scroll, { backgroundColor: theme.background }]}
    >
      <View style={styles.header}>
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
          {detail.isMissing ? "Missing from database" : updatedLabel}
        </Text>
      </View>

      <View style={styles.actionRow}>
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
      </View>

      <View style={styles.sectionHeader}>
        <Text style={[styles.sectionTitle, { color: theme.primaryText }]}>
          Songs
        </Text>
        <Text style={[styles.sectionMeta, { color: theme.secondaryText }]}>
          Reactive query
        </Text>
      </View>

      <LibraryCollectionSongList
        movingSongId={movingSongId}
        onMoveSong={
          kind === "album"
            ? async (songId, direction) => {
                setMovingSongId(songId);
                setMutationError(null);

                try {
                  const reorderedSongs = reorderSongs({
                    direction,
                    songId,
                    songs: detail.songs,
                  });

                  await updateAlbumSongOrder({
                    albumId: id,
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
              }
            : undefined
        }
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
    gap: 16,
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
