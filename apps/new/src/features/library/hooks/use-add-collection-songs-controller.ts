import { useCallback, useReducer } from "react";
import { useHapticFeedback } from "@/src/features/settings/hooks/use-haptic-feedback";
import type { AddableCollectionSong } from "../services/addable-collection-songs-service";
import type { LibraryCollectionDetailKind } from "../services/library-collection-detail-service";
import { useAddCollectionSongsCommands } from "./use-add-collection-songs-commands";
import {
  addCollectionSongsControllerReducer,
  getAddableSongSelectionState,
  initialAddCollectionSongsControllerState,
} from "../services/add-collection-songs-interaction-service";

export function useAddCollectionSongsController({
  collectionId,
  kind,
  songs,
}: {
  collectionId: number;
  kind: LibraryCollectionDetailKind;
  songs: AddableCollectionSong[];
}) {
  const { sendHaptic } = useHapticFeedback();
  const [controllerState, dispatchControllerState] = useReducer(
    addCollectionSongsControllerReducer,
    initialAddCollectionSongsControllerState,
  );
  const selectionState = getAddableSongSelectionState({
    isAddingSelection: controllerState.isAddingSelection,
    savingSongId: controllerState.savingSongId,
    songs,
    selectedSongIds: controllerState.selectedSongIds,
  });

  const toggleSongSelection = useCallback(
    (songId: number) => {
      sendHaptic("light");
      dispatchControllerState({ songId, type: "toggle-selection" });
    },
    [sendHaptic],
  );
  const { addSelectedSongs, addSong } = useAddCollectionSongsCommands({
    collectionId,
    dispatchControllerState,
    kind,
    selectionState,
    sendHaptic,
  });

  return {
    addSelectedSongs,
    addSong,
    mutationError: controllerState.mutationError,
    savingSongId: controllerState.savingSongId,
    selectedSongIds: controllerState.selectedSongIds,
    selectionState,
    toggleSongSelection,
  };
}
