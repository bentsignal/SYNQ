import { useCallback } from "react";
import type { HapticFeedbackType } from "@/src/features/settings/services/haptic-feedback-service";
import type { LibraryCollectionDetailKind } from "../services/library-collection-kind-service";
import {
  addLibraryCollectionSongCommand,
  addLibraryCollectionSongsCommand,
} from "../services/library-collection-command-service";
import {
  getAddCollectionSongsMutationErrorMessage,
  type AddCollectionSongsControllerAction,
} from "../services/add-collection-songs-state-service";
import type { AddableSongSelectionState } from "../services/add-collection-songs-selection-service";

type AddCollectionSongsControllerDispatch = (
  action: AddCollectionSongsControllerAction,
) => void;

export function useAddCollectionSongsCommands({
  collectionId,
  dispatchControllerState,
  kind,
  selectionState,
  sendHaptic,
}: {
  collectionId: number;
  dispatchControllerState: AddCollectionSongsControllerDispatch;
  kind: LibraryCollectionDetailKind;
  selectionState: AddableSongSelectionState;
  sendHaptic: (type: HapticFeedbackType) => void;
}) {
  const addSelectedSongs = useCallback(async () => {
    if (!selectionState.canBulkAdd) {
      sendHaptic("error");
      return;
    }

    sendHaptic("medium");
    dispatchControllerState({ type: "begin-add-selection" });

    try {
      await addLibraryCollectionSongsCommand({
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
  }, [collectionId, dispatchControllerState, kind, selectionState, sendHaptic]);

  const addSong = useCallback(
    async (songId: number) => {
      sendHaptic("light");
      dispatchControllerState({ songId, type: "begin-add-song" });

      try {
        await addLibraryCollectionSongCommand({
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
    [collectionId, dispatchControllerState, kind, sendHaptic],
  );

  return {
    addSelectedSongs,
    addSong,
  };
}
