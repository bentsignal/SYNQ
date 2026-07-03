import type { HapticFeedbackType } from "../../settings/services/haptic-feedback-service";
import type { LibraryCollectionDetailKind } from "./library-collection-kind-service";
import {
  getAddCollectionSongsBlockedCommand,
  getAddCollectionSongsFailureCommand,
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
  type AddCollectionSongsMutationKind,
  type AddCollectionSongsControllerAction,
} from "./add-collection-songs-state-service";

type AddCollectionSongsControllerDispatch = (
  action: AddCollectionSongsControllerAction,
) => void;

type AddCollectionSongsFlowDependencies = {
  dispatchControllerState: AddCollectionSongsControllerDispatch;
  sendHaptic: (haptic: HapticFeedbackType) => void;
};

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

type AddCollectionSongsActionCommand = {
  action: AddCollectionSongsControllerAction;
  haptic: HapticFeedbackType;
};

const runAddCollectionSongsMutationAttempt = async ({
  dispatchControllerState,
  finishAction,
  mutation,
  run,
  sendHaptic,
  startCommand,
  successCommand,
}: AddCollectionSongsFlowDependencies & {
  finishAction: AddCollectionSongsControllerAction;
  mutation: AddCollectionSongsMutationKind;
  run: () => Promise<void>;
  startCommand: AddCollectionSongsActionCommand;
  successCommand: AddCollectionSongsActionCommand;
}) => {
  sendHaptic(startCommand.haptic);
  dispatchControllerState(startCommand.action);

  try {
    await run();
    dispatchControllerState(successCommand.action);
    sendHaptic(successCommand.haptic);
  } catch (caughtError) {
    const command = getAddCollectionSongsFailureCommand({
      caughtError,
      mutation,
    });
    sendHaptic(command.haptic);
    dispatchControllerState(command.action);
  } finally {
    dispatchControllerState(finishAction);
  }
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
