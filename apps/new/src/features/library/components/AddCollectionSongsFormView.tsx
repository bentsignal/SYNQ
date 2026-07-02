import { Link } from "expo-router";
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { useCustomizationTheme } from "@/src/features/settings/hooks/use-customization-theme";
import type { AddableCollectionSong } from "../services/addable-collection-songs-service";
import type { AddableSongSelectionState } from "../services/library-collection-interaction-service";
import type { LibraryCollectionDetailKind } from "../hooks/use-library-collection-detail-query";
import { AddableSongList } from "./AddableSongList";

type AddCollectionSongsFormViewProps = {
  collectionId: number;
  hasErrors: boolean;
  kind: LibraryCollectionDetailKind;
  mutationError: string | null;
  onAddSelectedSongs: () => void;
  onAddSong: (songId: number) => void;
  onChangeQuery: (query: string) => void;
  onToggleSongSelection: (songId: number) => void;
  query: string;
  savingSongId: number | null;
  selectedSongIds: Set<number>;
  selectionState: AddableSongSelectionState;
  songs: AddableCollectionSong[];
  updatedLabel: string;
};

export function AddCollectionSongsFormView({
  collectionId,
  hasErrors,
  kind,
  mutationError,
  onAddSelectedSongs,
  onAddSong,
  onChangeQuery,
  onToggleSongSelection,
  query,
  savingSongId,
  selectedSongIds,
  selectionState,
  songs,
  updatedLabel,
}: AddCollectionSongsFormViewProps) {
  const theme = useCustomizationTheme();

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
        onChangeText={onChangeQuery}
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
          {selectionState.selectionLabel}
        </Text>
        <Pressable
          accessibilityRole="button"
          disabled={!selectionState.canBulkAdd}
          onPress={onAddSelectedSongs}
          style={[
            styles.bulkAddButton,
            { backgroundColor: theme.accent },
            !selectionState.canBulkAdd ? styles.disabled : null,
          ]}
        >
          <Text style={[styles.bulkAddText, { color: theme.onAccent }]}>
            {selectionState.bulkAddLabel}
          </Text>
        </Pressable>
      </View>

      <AddableSongList
        onAddSong={onAddSong}
        onToggleSongSelection={onToggleSongSelection}
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
        href={`/(tabs)/library/${kind}/${collectionId}`}
        style={[styles.backLink, { color: theme.accent }]}
      >
        Back to collection
      </Link>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: {
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
