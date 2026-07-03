import { Link } from "expo-router";
import { ScrollView } from "react-native";
import { useCustomizationTheme } from "@/src/features/settings/hooks/use-customization-theme";
import type { AddableCollectionSong } from "../services/addable-collection-songs-service";
import {
  getAddCollectionSongsBackLink,
  type AddCollectionSongsStatusState,
} from "../services/addable-collection-songs-screen-state-service";
import type { AddableSongSelectionState } from "../services/add-collection-songs-selection-service";
import type { LibraryCollectionDetailKind } from "../services/library-collection-kind-service";
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
  const backLink = getAddCollectionSongsBackLink({ collectionId, kind });

  return (
    <ScrollView
      className="flex-1"
      contentContainerClassName="gap-5 px-5 py-14"
      style={{ backgroundColor: theme.background }}
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
        className="text-[15px] font-extrabold"
        href={backLink.href}
        style={{ color: theme.accent }}
      >
        {backLink.label}
      </Link>
    </ScrollView>
  );
}
