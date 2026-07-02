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
import { formatDurationMs } from "@/src/features/app-shell/services/duration-format-service";
import { parseNumericRouteParam } from "@/src/features/app-shell/services/route-param-service";
import { useCustomizationTheme } from "@/src/features/settings/hooks/use-customization-theme";
import { useHapticFeedback } from "@/src/features/settings/hooks/use-haptic-feedback";
import {
  useAddableCollectionSongsQuery,
  type AddableCollectionSong,
} from "../hooks/use-addable-collection-songs-query";
import type { LibraryCollectionDetailKind } from "../hooks/use-library-collection-detail-query";
import {
  addSongToCollection,
  addSongsToCollection,
} from "../repository/relationship-repository";
import {
  getAddableSongRowState,
  getSelectedAddableSongIds,
  removeSongIdSelection,
  toggleSongIdSelection,
} from "../services/library-collection-interaction-service";

type AddCollectionSongsScreenProps = {
  kind: LibraryCollectionDetailKind;
};

export function AddCollectionSongsScreen({
  kind,
}: AddCollectionSongsScreenProps) {
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

  return <AddCollectionSongsContent id={id} kind={kind} />;
}

function AddCollectionSongsContent({
  id,
  kind,
}: {
  id: number;
  kind: LibraryCollectionDetailKind;
}) {
  const theme = useCustomizationTheme();
  const { sendHaptic } = useHapticFeedback();
  const [query, setQuery] = useState("");
  const [savingSongId, setSavingSongId] = useState<number | null>(null);
  const [selectedSongIds, setSelectedSongIds] = useState<Set<number>>(
    () => new Set(),
  );
  const [isAddingSelection, setIsAddingSelection] = useState(false);
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
  const selectedAddableSongIds = getSelectedAddableSongIds({
    selectedSongIds,
    songs,
  });
  const selectedCount = selectedAddableSongIds.length;
  const isMutating = isAddingSelection || savingSongId !== null;

  const toggleSongSelection = (songId: number) => {
    sendHaptic("light");
    setSelectedSongIds((currentSelection) => {
      return toggleSongIdSelection({
        selectedSongIds: currentSelection,
        songId,
      });
    });
  };

  const addSelectedSongs = async () => {
    if (selectedCount === 0) {
      sendHaptic("error");
      return;
    }

    sendHaptic("medium");
    setIsAddingSelection(true);
    setMutationError(null);

    try {
      await addSongsToCollection({
        collectionId: id,
        kind,
        songIds: selectedAddableSongIds,
      });
      setSelectedSongIds(new Set());
      sendHaptic("success");
    } catch (caughtError) {
      sendHaptic("error");
      setMutationError(
        caughtError instanceof Error
          ? caughtError.message
          : "Selected songs could not be added.",
      );
    } finally {
      setIsAddingSelection(false);
    }
  };

  return (
    <ScrollView
      contentContainerStyle={styles.content}
      style={[styles.scroll, { backgroundColor: theme.background }]}
    >
      <View style={styles.header}>
        <Text style={[styles.kicker, { color: theme.accent }]}>Add songs</Text>
        <Text style={[styles.title, { color: theme.primaryText }]}>
          Add to {kind}
        </Text>
        <Text style={[styles.subtitle, { color: theme.secondaryText }]}>
          Search your songs and add them to this collection.
        </Text>
      </View>

      <TextInput
        autoCapitalize="none"
        clearButtonMode="while-editing"
        onChangeText={setQuery}
        placeholder="Search songs, artists, or albums"
        placeholderTextColor={theme.mutedText}
        style={[
          styles.searchInput,
          {
            backgroundColor: theme.surface,
            borderColor: theme.border,
            color: theme.primaryText,
          },
        ]}
        value={query}
      />

      <View style={styles.sectionHeader}>
        <Text style={[styles.sectionTitle, { color: theme.primaryText }]}>
          Songs
        </Text>
        <Text style={[styles.sectionMeta, { color: theme.secondaryText }]}>
          {updatedLabel}
        </Text>
      </View>

      <View
        style={[
          styles.selectionPanel,
          { backgroundColor: theme.surface, borderColor: theme.border },
        ]}
      >
        <Text style={[styles.selectionText, { color: theme.secondaryText }]}>
          {selectedCount === 0
            ? "Select songs to add several at once."
            : `${selectedCount} selected`}
        </Text>
        <Pressable
          accessibilityRole="button"
          disabled={selectedCount === 0 || isMutating}
          onPress={addSelectedSongs}
          style={[
            styles.bulkAddButton,
            { backgroundColor: theme.accent },
            selectedCount === 0 || isMutating ? styles.disabled : null,
          ]}
        >
          <Text style={[styles.bulkAddText, { color: theme.onAccent }]}>
            {isAddingSelection ? "Adding" : "Add selected"}
          </Text>
        </Pressable>
      </View>

      <AddableSongList
        onAddSong={async (songId) => {
          sendHaptic("light");
          setSavingSongId(songId);
          setMutationError(null);

          try {
            await addSongToCollection({
              collectionId: id,
              kind,
              songId,
            });
            setSelectedSongIds((currentSelection) => {
              return removeSongIdSelection({
                selectedSongIds: currentSelection,
                songId,
              });
            });
            sendHaptic("success");
          } catch (caughtError) {
            sendHaptic("error");
            setMutationError(
              caughtError instanceof Error
                ? caughtError.message
                : "Song could not be added.",
            );
          } finally {
            setSavingSongId(null);
          }
        }}
        onToggleSongSelection={toggleSongSelection}
        selectedSongIds={selectedSongIds}
        savingSongId={savingSongId}
        songs={songs}
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
                hasErrors || mutationError
                  ? theme.danger
                  : theme.secondaryText,
            },
          ]}
        >
          {mutationError ??
            (hasErrors ? "One or more song queries failed." : updatedLabel)}
        </Text>
      </View>

      <Link
        href={`/(tabs)/library/${kind}/${id}`}
        style={[styles.backLink, { color: theme.accent }]}
      >
        Back to collection
      </Link>
    </ScrollView>
  );
}

function AddableSongList({
  onAddSong,
  onToggleSongSelection,
  selectedSongIds,
  savingSongId,
  songs,
}: {
  onAddSong: (songId: number) => void;
  onToggleSongSelection: (songId: number) => void;
  selectedSongIds: Set<number>;
  savingSongId: number | null;
  songs: AddableCollectionSong[];
}) {
  const theme = useCustomizationTheme();

  if (songs.length === 0) {
    return (
      <View
        style={[
          styles.emptyPanel,
          { backgroundColor: theme.surface, borderColor: theme.border },
        ]}
      >
        <Text style={[styles.emptyTitle, { color: theme.primaryText }]}>
          No matching songs
        </Text>
        <Text style={[styles.emptyBody, { color: theme.secondaryText }]}>
          Try a different search term or import more music into the library.
        </Text>
      </View>
    );
  }

  return (
    <View
      style={[
        styles.list,
        { backgroundColor: theme.surface, borderColor: theme.border },
      ]}
    >
      {songs.map((song) => {
        const { isDisabled, isSaving, isSelected } = getAddableSongRowState({
          savingSongId,
          selectedSongIds,
          song,
        });

        return (
          <View
            key={song.id}
            style={[styles.row, { borderBottomColor: theme.borderSubtle }]}
          >
            <Pressable
              accessibilityRole="checkbox"
              accessibilityState={{
                checked: isSelected,
                disabled: song.isLinked,
              }}
              disabled={song.isLinked}
              onPress={() => onToggleSongSelection(song.id)}
              style={[
                styles.selectBox,
                { borderColor: theme.border },
                isSelected
                  ? { backgroundColor: theme.accent, borderColor: theme.accent }
                  : null,
                song.isLinked ? styles.disabled : null,
              ]}
            >
              <Text
                style={[
                  styles.selectMark,
                  { color: isSelected ? theme.onAccent : theme.mutedText },
                ]}
              >
                {isSelected ? "x" : ""}
              </Text>
            </Pressable>
            <View style={styles.rowText}>
              <Text
                numberOfLines={1}
                style={[styles.songTitle, { color: theme.primaryText }]}
              >
                {song.title}
              </Text>
              <Text
                numberOfLines={1}
                style={[styles.songMeta, { color: theme.secondaryText }]}
              >
                {song.artist} / {song.album}
              </Text>
            </View>
            <Text style={[styles.duration, { color: theme.primaryText }]}>
              {formatDurationMs(song.duration)}
            </Text>
            <Pressable
              accessibilityRole="button"
              disabled={isDisabled}
              onPress={() => onAddSong(song.id)}
              style={[
                styles.addButton,
                {
                  backgroundColor: isDisabled ? theme.border : theme.accent,
                },
              ]}
            >
              <Text style={[styles.addButtonText, { color: theme.onAccent }]}>
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
  searchInput: {
    borderRadius: 8,
    borderWidth: 1,
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
    textAlign: "right",
    textTransform: "uppercase",
  },
  selectionPanel: {
    alignItems: "center",
    borderRadius: 8,
    borderWidth: 1,
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
    justifyContent: "space-between",
    minHeight: 58,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  selectionText: {
    flex: 1,
    fontSize: 14,
    lineHeight: 20,
    minWidth: 150,
  },
  bulkAddButton: {
    alignItems: "center",
    borderRadius: 8,
    justifyContent: "center",
    minHeight: 38,
    minWidth: 118,
    paddingHorizontal: 12,
  },
  bulkAddText: {
    fontSize: 12,
    fontWeight: "800",
    letterSpacing: 0,
    textTransform: "uppercase",
  },
  emptyPanel: {
    borderRadius: 8,
    borderWidth: 1,
    gap: 8,
    padding: 16,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: "800",
    letterSpacing: 0,
    lineHeight: 21,
  },
  emptyBody: {
    fontSize: 14,
    lineHeight: 20,
  },
  list: {
    borderRadius: 8,
    borderWidth: 1,
    overflow: "hidden",
  },
  row: {
    alignItems: "center",
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
  selectBox: {
    alignItems: "center",
    borderRadius: 8,
    borderWidth: 2,
    height: 30,
    justifyContent: "center",
    width: 30,
  },
  selectMark: {
    fontSize: 15,
    fontWeight: "800",
    letterSpacing: 0,
    lineHeight: 20,
  },
  songTitle: {
    fontSize: 15,
    fontWeight: "800",
    letterSpacing: 0,
    lineHeight: 20,
  },
  songMeta: {
    fontSize: 13,
    lineHeight: 18,
  },
  duration: {
    fontSize: 13,
    fontWeight: "800",
    letterSpacing: 0,
    minWidth: 44,
    textAlign: "right",
  },
  addButton: {
    alignItems: "center",
    borderRadius: 8,
    justifyContent: "center",
    minHeight: 34,
    minWidth: 66,
    paddingHorizontal: 10,
  },
  addButtonText: {
    fontSize: 11,
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
});
