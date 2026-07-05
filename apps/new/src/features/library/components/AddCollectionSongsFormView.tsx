import { Link } from "expo-router";
import { ScrollView } from "react-native";
import { useCustomizationTheme } from "@/src/features/settings/hooks/use-customization-theme";
import type { AddCollectionSongsFormState } from "../services/add-collection-songs-form-state-service";
import type { AddCollectionSongsStatusState } from "../services/add-collection-songs-status-state-service";
import type { AddableSongSelectionState } from "../services/add-collection-songs-selection-service";
import type { AddableSongRowModel } from "../services/add-collection-songs-row-state-service";
import { AddCollectionSongsHeader } from "./AddCollectionSongsHeader";
import { AddCollectionSongsSectionHeader } from "./AddCollectionSongsSectionHeader";
import { AddCollectionSongsSelectionPanel } from "./AddCollectionSongsSelectionPanel";
import { AddCollectionSongsStatusPanel } from "./AddCollectionSongsStatusPanel";
import { AddableSongList } from "./AddableSongList";

type AddCollectionSongsFormViewProps = {
  formState: AddCollectionSongsFormState;
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
        header={formState.header}
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
