import { Link } from "expo-router";
import { ScrollView, StyleSheet } from "react-native";
import { useCustomizationTheme } from "@/src/features/settings/hooks/use-customization-theme";
import {
  getAddCollectionSongsBackHref,
  type AddableCollectionSong,
  type AddCollectionSongsStatusState,
} from "../services/addable-collection-songs-service";
import type { AddableSongSelectionState } from "../services/library-collection-interaction-service";
import type { LibraryCollectionDetailKind } from "../hooks/use-library-collection-detail-query";
import { AddCollectionSongsHeader } from "./AddCollectionSongsHeader";
import { AddCollectionSongsSectionHeader } from "./AddCollectionSongsSectionHeader";
import { AddCollectionSongsSelectionPanel } from "./AddCollectionSongsSelectionPanel";
import { AddCollectionSongsStatusPanel } from "./AddCollectionSongsStatusPanel";
import { AddableSongList } from "./AddableSongList";

type AddCollectionSongsFormViewProps = {
  collectionId: number;
  kind: LibraryCollectionDetailKind;
  onAddSelectedSongs: () => void;
  onAddSong: (songId: number) => void;
  onChangeQuery: (query: string) => void;
  onToggleSongSelection: (songId: number) => void;
  query: string;
  savingSongId: number | null;
  selectedSongIds: Set<number>;
  selectionState: AddableSongSelectionState;
  songs: AddableCollectionSong[];
  statusState: AddCollectionSongsStatusState;
  updatedLabel: string;
};

export function AddCollectionSongsFormView({
  collectionId,
  kind,
  onAddSelectedSongs,
  onAddSong,
  onChangeQuery,
  onToggleSongSelection,
  query,
  savingSongId,
  selectedSongIds,
  selectionState,
  songs,
  statusState,
  updatedLabel,
}: AddCollectionSongsFormViewProps) {
  const theme = useCustomizationTheme();

  return (
    <ScrollView
      contentContainerStyle={styles.content}
      style={[styles.scroll, { backgroundColor: theme.background }]}
    >
      <AddCollectionSongsHeader
        kind={kind}
        onChangeQuery={onChangeQuery}
        query={query}
      />

      <AddCollectionSongsSectionHeader updatedLabel={updatedLabel} />

      <AddCollectionSongsSelectionPanel
        onAddSelectedSongs={onAddSelectedSongs}
        selectionState={selectionState}
      />

      <AddableSongList
        onAddSong={onAddSong}
        onToggleSongSelection={onToggleSongSelection}
        selectedSongIds={selectedSongIds}
        savingSongId={savingSongId}
        songs={songs}
      />

      <AddCollectionSongsStatusPanel
        statusState={statusState}
      />

      <Link
        href={getAddCollectionSongsBackHref({ collectionId, kind })}
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
  backLink: {
    fontSize: 15,
    fontWeight: "800",
    letterSpacing: 0,
  },
});
