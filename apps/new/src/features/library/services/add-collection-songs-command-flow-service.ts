import type { LibraryCollectionDetailKind } from "./library-collection-kind-service";
import {
  getAddCollectionSongsBlockedCommand,
  getAddCollectionSongsSelectionStartCommand,
  getAddCollectionSongsSelectionSuccessCommand,
} from "./add-collection-songs-command-state-service";
import type { AddableSongSelectionState } from "./add-collection-songs-selection-service";
import { getAddCollectionSongsFinishSelectionAction } from "./add-collection-songs-action-service";
import {
  runAddCollectionSongsMutationAttempt,
  type AddCollectionSongsFlowDependencies,
} from "./add-collection-songs-mutation-runtime-service";

type AddCollectionSongsBaseCommandParams = AddCollectionSongsFlowDependencies & {
  collectionId: number;
  kind: LibraryCollectionDetailKind;
};

type AddCollectionSongsSelectionCommandParams =
  AddCollectionSongsBaseCommandParams & {
    addCollectionSongs: (params: {
      collectionId: number;
      kind: LibraryCollectionDetailKind;
      songIds: number[];
    }) => Promise<void>;
    selectionState: AddableSongSelectionState;
  };

export const runAddCollectionSongsSelectionCommand = async ({
  addCollectionSongs,
  collectionId,
  dispatchControllerState,
  kind,
  selectionState,
  sendHaptic,
}: AddCollectionSongsSelectionCommandParams) => {
  if (!selectionState.canBulkAdd) {
    const command = getAddCollectionSongsBlockedCommand();
    sendHaptic(command.haptic);
    return;
  }

  await runAddCollectionSongsMutationAttempt({
    dispatchControllerState,
    finishAction: getAddCollectionSongsFinishSelectionAction(),
    mutation: "add-selection",
    run: () =>
      addCollectionSongs({
        collectionId,
        kind,
        songIds: selectionState.selectedAddableSongIds,
      }),
    sendHaptic,
    startCommand: getAddCollectionSongsSelectionStartCommand(),
    successCommand: getAddCollectionSongsSelectionSuccessCommand(),
  });
};
