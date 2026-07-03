import { useCallback } from "react";
import { useHapticFeedback } from "@/src/features/settings/hooks/use-haptic-feedback";
import type { LibraryCollectionDetailKind } from "../services/library-collection-kind-service";
import {
  addLibraryCollectionSongCommand,
  addLibraryCollectionSongsCommand,
} from "../services/library-collection-command-service";
import {
  runAddCollectionSongCommand,
  runAddCollectionSongsSelectionCommand,
  runAddCollectionSongsToggleSelectionCommand,
} from "../services/add-collection-songs-command-flow-service";
import type { AddCollectionSongsControllerDispatch } from "../services/add-collection-songs-mutation-runtime-service";
import type { AddableSongSelectionState } from "../services/add-collection-songs-selection-service";

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
      runAddCollectionSongsToggleSelectionCommand({
        dispatchControllerState,
        sendHaptic,
        songId,
      });
    },
    [dispatchControllerState, sendHaptic],
  );

  const addSelectedSongs = useCallback(async () => {
    await runAddCollectionSongsSelectionCommand({
      addCollectionSongs: addLibraryCollectionSongsCommand,
      collectionId,
      dispatchControllerState,
      kind,
      selectionState,
      sendHaptic,
    });
  }, [collectionId, dispatchControllerState, kind, selectionState, sendHaptic]);

  const addSong = useCallback(
    async (songId: number) => {
      await runAddCollectionSongCommand({
        addCollectionSong: addLibraryCollectionSongCommand,
        collectionId,
        dispatchControllerState,
        kind,
        sendHaptic,
        songId,
      });
    },
    [collectionId, dispatchControllerState, kind, sendHaptic],
  );

  return {
    addSelectedSongs,
    addSong,
    toggleSongSelection,
  };
}
