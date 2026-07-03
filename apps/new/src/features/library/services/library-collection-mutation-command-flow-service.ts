import type { HapticFeedbackType } from "../../settings/services/haptic-feedback-service";
import type { CollectionDetailActionState } from "./library-collection-action-state-service";
import type {
  LibraryCollectionDetail,
  LibraryCollectionDetailSong,
} from "./library-collection-detail-service";
import type { LibraryCollectionDetailKind } from "./library-collection-kind-service";
import {
  getCollectionDetailMutationBlockedCommand,
  getCollectionDetailMutationFailureCommand,
  getCollectionExportFinishCommand,
  getCollectionExportStartCommand,
  getCollectionExportSuccessCommand,
  getCollectionSongMoveFinishCommand,
  getCollectionSongMoveStartCommand,
  getCollectionSongMoveSuccessCommand,
  getCollectionSongRemovalFinishCommand,
  getCollectionSongRemovalStartCommand,
  getCollectionSongRemovalSuccessCommand,
} from "./library-collection-mutation-service";
import type { CollectionDetailMutationAction } from "./library-collection-mutation-state-service";

type CollectionDetailMutationDispatch = (
  action: CollectionDetailMutationAction,
) => void;

type HapticSender = (type: HapticFeedbackType) => void;

export const runLibraryCollectionExportCommand = async ({
  actionState,
  dispatch,
  exportLibraryCollection,
  sendHaptic,
}: {
  actionState: CollectionDetailActionState;
  dispatch: CollectionDetailMutationDispatch;
  exportLibraryCollection: (
    songs: CollectionDetailActionState["playableSongs"],
  ) => Promise<unknown>;
  sendHaptic: HapticSender;
}) => {
  if (!actionState.canExport) {
    sendHaptic(getCollectionDetailMutationBlockedCommand().haptic);
    return;
  }

  dispatch(getCollectionExportStartCommand().action);

  try {
    await exportLibraryCollection(actionState.playableSongs);
    sendHaptic(getCollectionExportSuccessCommand().haptic);
  } catch (caughtError) {
    const command = getCollectionDetailMutationFailureCommand({
      caughtError,
      mutation: "export-collection",
    });
    sendHaptic(command.haptic);
    dispatch(command.action);
  } finally {
    dispatch(getCollectionExportFinishCommand().action);
  }
};

export const runLibraryCollectionSongMoveCommand = async ({
  collectionId,
  detail,
  direction,
  dispatch,
  kind,
  moveLibraryCollectionSong,
  sendHaptic,
  songId,
}: {
  collectionId: number;
  detail: Pick<LibraryCollectionDetail, "songs">;
  direction: "down" | "up";
  dispatch: CollectionDetailMutationDispatch;
  kind: LibraryCollectionDetailKind;
  moveLibraryCollectionSong: (params: {
    collectionId: number;
    direction: "down" | "up";
    kind: LibraryCollectionDetailKind;
    songId: number;
    songs: LibraryCollectionDetailSong[];
  }) => Promise<void>;
  sendHaptic: HapticSender;
  songId: number;
}) => {
  dispatch(getCollectionSongMoveStartCommand(songId).action);

  try {
    await moveLibraryCollectionSong({
      collectionId,
      direction,
      kind,
      songId,
      songs: detail.songs,
    });
    sendHaptic(getCollectionSongMoveSuccessCommand().haptic);
  } catch (caughtError) {
    const command = getCollectionDetailMutationFailureCommand({
      caughtError,
      mutation: "move-song",
    });
    sendHaptic(command.haptic);
    dispatch(command.action);
  } finally {
    dispatch(getCollectionSongMoveFinishCommand().action);
  }
};

export const runLibraryCollectionSongRemoveCommand = async ({
  collectionId,
  dispatch,
  kind,
  removeLibraryCollectionSong,
  sendHaptic,
  songId,
}: {
  collectionId: number;
  dispatch: CollectionDetailMutationDispatch;
  kind: LibraryCollectionDetailKind;
  removeLibraryCollectionSong: (params: {
    collectionId: number;
    kind: LibraryCollectionDetailKind;
    songId: number;
  }) => Promise<void>;
  sendHaptic: HapticSender;
  songId: number;
}) => {
  dispatch(getCollectionSongRemovalStartCommand(songId).action);

  try {
    await removeLibraryCollectionSong({
      collectionId,
      kind,
      songId,
    });
    sendHaptic(getCollectionSongRemovalSuccessCommand().haptic);
  } catch (caughtError) {
    const command = getCollectionDetailMutationFailureCommand({
      caughtError,
      mutation: "remove-song",
    });
    sendHaptic(command.haptic);
    dispatch(command.action);
  } finally {
    dispatch(getCollectionSongRemovalFinishCommand().action);
  }
};
