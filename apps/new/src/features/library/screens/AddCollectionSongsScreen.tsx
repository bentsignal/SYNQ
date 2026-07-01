import { useState } from "react";
import { Link, useLocalSearchParams } from "expo-router";
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import {
  useAddableCollectionSongsQuery,
  type AddableCollectionSong,
} from "../hooks/use-addable-collection-songs-query";
import type { LibraryCollectionDetailKind } from "../hooks/use-library-collection-detail-query";
import { addSongToCollection } from "../repository/relationship-repository";

type AddCollectionSongsScreenProps = {
  kind: LibraryCollectionDetailKind;
};

const parseId = (value: string | string[] | undefined) => {
  const rawValue = Array.isArray(value) ? value[0] : value;
  const id = Number(rawValue);

  return Number.isFinite(id) ? id : null;
};

const formatDuration = (duration: number | null) => {
  if (!duration) {
    return "--:--";
  }

  const totalSeconds = Math.round(duration / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;

  return `${minutes}:${seconds.toString().padStart(2, "0")}`;
};

export function AddCollectionSongsScreen({
  kind,
}: AddCollectionSongsScreenProps) {
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

  return <AddCollectionSongsContent id={id} kind={kind} />;
}

function AddCollectionSongsContent({
  id,
  kind,
}: {
  id: number;
  kind: LibraryCollectionDetailKind;
}) {
  const [query, setQuery] = useState("");
  const [savingSongId, setSavingSongId] = useState<number | null>(null);
  const [mutationError, setMutationError] = useState<string | null>(null);
  const { errors, songs, updatedAt } = useAddableCollectionSongsQuery({
    collectionId: id,
    kind,
    query,
  });
  const hasErrors = errors.length > 0;
  const updatedLabel =
    updatedAt > 0
      ? `Updated ${new Date(updatedAt).toLocaleTimeString()}`
      : "Waiting for library data";

  return (
    <ScrollView contentContainerStyle={styles.content} style={styles.scroll}>
      <View style={styles.header}>
        <Text style={styles.kicker}>Add songs</Text>
        <Text style={styles.title}>Add to {kind}</Text>
        <Text style={styles.subtitle}>
          Search the shared song library and attach songs without leaving this
          feature flow.
        </Text>
      </View>

      <TextInput
        autoCapitalize="none"
        clearButtonMode="while-editing"
        onChangeText={setQuery}
        placeholder="Search songs, artists, or albums"
        placeholderTextColor="#74807a"
        style={styles.searchInput}
        value={query}
      />

      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Songs</Text>
        <Text style={styles.sectionMeta}>{updatedLabel}</Text>
      </View>

      <AddableSongList
        onAddSong={async (songId) => {
          setSavingSongId(songId);
          setMutationError(null);

          try {
            await addSongToCollection({
              collectionId: id,
              kind,
              songId,
            });
          } catch (caughtError) {
            setMutationError(
              caughtError instanceof Error
                ? caughtError.message
                : "Song could not be added.",
            );
          } finally {
            setSavingSongId(null);
          }
        }}
        savingSongId={savingSongId}
        songs={songs}
      />

      <View style={styles.panel}>
        <Text style={hasErrors ? styles.errorText : styles.panelText}>
          {mutationError ??
            (hasErrors ? "One or more song queries failed." : updatedLabel)}
        </Text>
      </View>

      <Link href={`/(tabs)/library/${kind}/${id}`} style={styles.backLink}>
        Back to collection
      </Link>
    </ScrollView>
  );
}

function AddableSongList({
  onAddSong,
  savingSongId,
  songs,
}: {
  onAddSong: (songId: number) => void;
  savingSongId: number | null;
  songs: AddableCollectionSong[];
}) {
  if (songs.length === 0) {
    return (
      <View style={styles.emptyPanel}>
        <Text style={styles.emptyTitle}>No matching songs</Text>
        <Text style={styles.emptyBody}>
          Try a different search term or import more music into the library.
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.list}>
      {songs.map((song) => {
        const isSaving = savingSongId === song.id;
        const isDisabled = song.isLinked || isSaving;

        return (
          <View key={song.id} style={styles.row}>
            <View style={styles.rowText}>
              <Text numberOfLines={1} style={styles.songTitle}>
                {song.title}
              </Text>
              <Text numberOfLines={1} style={styles.songMeta}>
                {song.artist} / {song.album}
              </Text>
            </View>
            <Text style={styles.duration}>{formatDuration(song.duration)}</Text>
            <Pressable
              accessibilityRole="button"
              disabled={isDisabled}
              onPress={() => onAddSong(song.id)}
              style={[
                styles.addButton,
                isDisabled ? styles.disabledButton : null,
              ]}
            >
              <Text style={styles.addButtonText}>
                {song.isLinked ? "Added" : isSaving ? "Adding" : "Add"}
              </Text>
            </Pressable>
          </View>
        );
      })}
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
  searchInput: {
    backgroundColor: "#ffffff",
    borderColor: "#dbe3de",
    borderRadius: 8,
    borderWidth: 1,
    color: "#121417",
    fontSize: 16,
    minHeight: 48,
    paddingHorizontal: 14,
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
    textAlign: "right",
    textTransform: "uppercase",
  },
  emptyPanel: {
    backgroundColor: "#ffffff",
    borderColor: "#dbe3de",
    borderRadius: 8,
    borderWidth: 1,
    gap: 8,
    padding: 16,
  },
  emptyTitle: {
    color: "#121417",
    fontSize: 16,
    fontWeight: "800",
    letterSpacing: 0,
    lineHeight: 21,
  },
  emptyBody: {
    color: "#52605a",
    fontSize: 14,
    lineHeight: 20,
  },
  list: {
    backgroundColor: "#ffffff",
    borderColor: "#dbe3de",
    borderRadius: 8,
    borderWidth: 1,
    overflow: "hidden",
  },
  row: {
    alignItems: "center",
    borderBottomColor: "#edf2ef",
    borderBottomWidth: 1,
    flexDirection: "row",
    gap: 12,
    minHeight: 66,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  rowText: {
    flex: 1,
    gap: 4,
    minWidth: 0,
  },
  songTitle: {
    color: "#121417",
    fontSize: 15,
    fontWeight: "800",
    letterSpacing: 0,
    lineHeight: 20,
  },
  songMeta: {
    color: "#52605a",
    fontSize: 13,
    lineHeight: 18,
  },
  duration: {
    color: "#29322e",
    fontSize: 13,
    fontWeight: "800",
    letterSpacing: 0,
    minWidth: 44,
    textAlign: "right",
  },
  addButton: {
    alignItems: "center",
    backgroundColor: "#0f766e",
    borderRadius: 8,
    justifyContent: "center",
    minHeight: 34,
    minWidth: 66,
    paddingHorizontal: 10,
  },
  disabledButton: {
    backgroundColor: "#dbe3de",
  },
  addButtonText: {
    color: "#ffffff",
    fontSize: 11,
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
  backLink: {
    color: "#0f766e",
    fontSize: 15,
    fontWeight: "800",
    letterSpacing: 0,
  },
});
