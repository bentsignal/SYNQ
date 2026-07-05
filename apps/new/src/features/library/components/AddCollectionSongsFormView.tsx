import { Link } from "expo-router";
import { ScrollView } from "react-native";
import { useCustomizationTheme } from "@/src/features/settings/hooks/use-customization-theme";
import {
  type AddCollectionSongsFormState,
  type AddCollectionSongsStatusState,
} from "../services/addable-collection-songs-screen-state-service";
import type {
  AddableSongRowModel,
  AddableSongSelectionState,
} from "../services/add-collection-songs-selection-service";
import type { LibraryCollectionDetailKind } from "../services/library-collection-kind-service";
import { AddCollectionSongsHeader } from "./AddCollectionSongsHeader";
import { AddCollectionSongsSectionHeader } from "./AddCollectionSongsSectionHeader";
import { AddCollectionSongsSelectionPanel } from "./AddCollectionSongsSelectionPanel";
import { AddCollectionSongsStatusPanel } from "./AddCollectionSongsStatusPanel";
import { AddableSongList } from "./AddableSongList";

type AddCollectionSongsFormViewProps = {
  formState: AddCollectionSongsFormState;
  kind: LibraryCollectionDetailKind;
  onAddSelectedSongs: () => void;
  onAddSong: (songId: number) => void;
  onChangeQuery: (query: string) => void;
  onToggleSongSelection: (songId: number) => void;
  query: string;
  rows: AddableSongRowModel[];
  selectionState: AddableSongSelectionState;
  statusState: AddCollectionSongsStatusState;
  updatedLabel: string;
};

export function AddCollectionSongsFormView({
  formState,
  kind,
  onAddSelectedSongs,
  onAddSong,
  onChangeQuery,
  onToggleSongSelection,
  query,
  rows,
  selectionState,
  statusState,
  updatedLabel,
}: AddCollectionSongsFormViewProps) {
  const theme = useCustomizationTheme();

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
        rows={rows}
      />

      <AddCollectionSongsStatusPanel
        statusState={statusState}
      />

      <Link
        className="text-[15px] font-extrabold"
        href={formState.backLink.href}
        style={{ color: theme.accent }}
      >
        {formState.backLink.label}
      </Link>
    </ScrollView>
  );
}
