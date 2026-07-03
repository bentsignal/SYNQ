import type { LibraryCollectionDetailKind } from "./library-collection-kind-service";
import {
  getAddCollectionSongsBlockedCommand,
  getAddCollectionSongsSelectionStartCommand,
  getAddCollectionSongsSelectionSuccessCommand,
  getAddCollectionSongsSongStartCommand,
  getAddCollectionSongsSongSuccessCommand,
  getAddCollectionSongsToggleSelectionCommand,
} from "./add-collection-songs-command-state-service";
import type { AddableSongSelectionState } from "./add-collection-songs-selection-service";
import {
  getAddCollectionSongsFinishSelectionAction,
  getAddCollectionSongsFinishSongAction,
} from "./add-collection-songs-state-service";
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

type AddCollectionSongCommandParams = AddCollectionSongsBaseCommandParams & {
  addCollectionSong: (params: {
    collectionId: number;
    kind: LibraryCollectionDetailKind;
    songId: number;
  }) => Promise<void>;
};

export const runAddCollectionSongsToggleSelectionCommand = ({
  dispatchControllerState,
  sendHaptic,
  songId,
}: AddCollectionSongsFlowDependencies & {
  songId: number;
}) => {
  const command = getAddCollectionSongsToggleSelectionCommand(songId);
  sendHaptic(command.haptic);
  dispatchControllerState(command.action);
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

export const runAddCollectionSongCommand = async ({
  addCollectionSong,
  collectionId,
  dispatchControllerState,
  kind,
  sendHaptic,
  songId,
}: AddCollectionSongCommandParams & {
  songId: number;
}) => {
  await runAddCollectionSongsMutationAttempt({
    dispatchControllerState,
    finishAction: getAddCollectionSongsFinishSongAction(),
    mutation: "add-song",
    run: () =>
      addCollectionSong({
        collectionId,
        kind,
        songId,
      }),
    sendHaptic,
    startCommand: getAddCollectionSongsSongStartCommand(songId),
    successCommand: getAddCollectionSongsSongSuccessCommand(songId),
  });
};
