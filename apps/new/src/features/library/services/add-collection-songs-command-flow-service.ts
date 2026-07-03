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
import type { AddCollectionSongsControllerAction } from "./add-collection-songs-state-service";

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

  const startCommand = getAddCollectionSongsSelectionStartCommand();
  sendHaptic(startCommand.haptic);
  dispatchControllerState(startCommand.action);

  try {
    await addCollectionSongs({
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
  const startCommand = getAddCollectionSongsSongStartCommand(songId);
  sendHaptic(startCommand.haptic);
  dispatchControllerState(startCommand.action);

  try {
    await addCollectionSong({
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
};
