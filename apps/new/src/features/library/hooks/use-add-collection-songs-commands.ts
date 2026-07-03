import { useCallback } from "react";
import { useHapticFeedback } from "@/src/features/settings/hooks/use-haptic-feedback";
import type { LibraryCollectionDetailKind } from "../services/library-collection-kind-service";
import {
  addLibraryCollectionSongCommand,
  addLibraryCollectionSongsCommand,
} from "../services/library-collection-command-service";
import {
  getAddCollectionSongsBlockedCommand,
  getAddCollectionSongsFailureCommand,
  getAddCollectionSongsSelectionStartCommand,
  getAddCollectionSongsSelectionSuccessCommand,
  getAddCollectionSongsSongStartCommand,
  getAddCollectionSongsSongSuccessCommand,
  getAddCollectionSongsToggleSelectionCommand,
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
}: {
  collectionId: number;
  dispatchControllerState: AddCollectionSongsControllerDispatch;
  kind: LibraryCollectionDetailKind;
  selectionState: AddableSongSelectionState;
}) {
  const { sendHaptic } = useHapticFeedback();

  const toggleSongSelection = useCallback(
    (songId: number) => {
      const command = getAddCollectionSongsToggleSelectionCommand(songId);
      sendHaptic(command.haptic);
      dispatchControllerState(command.action);
    },
    [dispatchControllerState, sendHaptic],
  );

  const addSelectedSongs = useCallback(async () => {
    if (!selectionState.canBulkAdd) {
      const command = getAddCollectionSongsBlockedCommand();
      sendHaptic(command.haptic);
      return;
    }

    const startCommand = getAddCollectionSongsSelectionStartCommand();
    sendHaptic(startCommand.haptic);
    dispatchControllerState(startCommand.action);

    try {
      await addLibraryCollectionSongsCommand({
        collectionId,
        kind,
        songIds: selectionState.selectedAddableSongIds,
      });
      const command = getAddCollectionSongsSelectionSuccessCommand();
      dispatchControllerState(command.action);
      sendHaptic(command.haptic);
    } catch (caughtError) {
      const command = getAddCollectionSongsFailureCommand({
        caughtError,
        mutation: "add-selection",
      });
      sendHaptic(command.haptic);
      dispatchControllerState(command.action);
    } finally {
      dispatchControllerState({ type: "finish-add-selection" });
    }
  }, [collectionId, dispatchControllerState, kind, selectionState, sendHaptic]);

  const addSong = useCallback(
    async (songId: number) => {
      const startCommand = getAddCollectionSongsSongStartCommand(songId);
      sendHaptic(startCommand.haptic);
      dispatchControllerState(startCommand.action);

      try {
        await addLibraryCollectionSongCommand({
          collectionId,
          kind,
          songId,
        });
        const command = getAddCollectionSongsSongSuccessCommand(songId);
        dispatchControllerState(command.action);
        sendHaptic(command.haptic);
      } catch (caughtError) {
        const command = getAddCollectionSongsFailureCommand({
          caughtError,
          mutation: "add-song",
        });
        sendHaptic(command.haptic);
        dispatchControllerState(command.action);
      } finally {
        dispatchControllerState({ type: "finish-add-song" });
      }
    },
    [collectionId, dispatchControllerState, kind, sendHaptic],
  );

  return {
    addSelectedSongs,
    addSong,
    toggleSongSelection,
  };
}
