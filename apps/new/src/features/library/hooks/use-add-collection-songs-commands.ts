import { useMemo } from "react";
import { useHapticFeedback } from "@/src/features/settings/hooks/use-haptic-feedback";
import type { LibraryCollectionDetailKind } from "../services/library-collection-kind-service";
import {
  addLibraryCollectionSongCommand,
  addLibraryCollectionSongsCommand,
} from "../services/library-collection-command-service";
import {
  createAddCollectionSongsCommands,
} from "../services/add-collection-songs-controller-command-service";
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

  return useMemo(
    () =>
      createAddCollectionSongsCommands({
        addCollectionSong: addLibraryCollectionSongCommand,
        addCollectionSongs: addLibraryCollectionSongsCommand,
        collectionId,
        dispatchControllerState,
        kind,
        selectionState,
        sendHaptic,
      }),
    [collectionId, dispatchControllerState, kind, selectionState, sendHaptic],
  );
}
