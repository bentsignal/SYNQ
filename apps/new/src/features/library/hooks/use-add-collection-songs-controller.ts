import { useCallback, useReducer } from "react";
import { useHapticFeedback } from "@/src/features/settings/hooks/use-haptic-feedback";
import type { AddableCollectionSong } from "../services/addable-collection-songs-service";
import type { LibraryCollectionDetailKind } from "../services/library-collection-detail-service";
import {
  addSongToCollection,
  addSongsToCollection,
} from "../repository/relationship-repository";
import {
  addCollectionSongsControllerReducer,
  getAddCollectionSongsMutationErrorMessage,
  getAddableSongSelectionState,
  initialAddCollectionSongsControllerState,
} from "../services/library-collection-interaction-service";

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

  const addSelectedSongs = useCallback(async () => {
    if (!selectionState.canBulkAdd) {
      sendHaptic("error");
      return;
    }

    sendHaptic("medium");
    dispatchControllerState({ type: "begin-add-selection" });

    try {
      await addSongsToCollection({
        collectionId,
        kind,
        songIds: selectionState.selectedAddableSongIds,
      });
      dispatchControllerState({ type: "clear-selection" });
      sendHaptic("success");
    } catch (caughtError) {
      sendHaptic("error");
      dispatchControllerState({
        error: getAddCollectionSongsMutationErrorMessage({
          caughtError,
          mutation: "add-selection",
        }),
        type: "fail",
      });
    } finally {
      dispatchControllerState({ type: "finish-add-selection" });
    }
  }, [collectionId, kind, selectionState, sendHaptic]);

  const addSong = useCallback(
    async (songId: number) => {
      sendHaptic("light");
      dispatchControllerState({ songId, type: "begin-add-song" });

      try {
        await addSongToCollection({
          collectionId,
          kind,
          songId,
        });
        dispatchControllerState({ songId, type: "remove-selection" });
        sendHaptic("success");
      } catch (caughtError) {
        sendHaptic("error");
        dispatchControllerState({
          error: getAddCollectionSongsMutationErrorMessage({
            caughtError,
            mutation: "add-song",
          }),
          type: "fail",
        });
      } finally {
        dispatchControllerState({ type: "finish-add-song" });
      }
    },
    [collectionId, kind, sendHaptic],
  );

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
