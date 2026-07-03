import type {
  LibraryCollectionDetail,
  LibraryCollectionDetailSong,
} from "./library-collection-detail-service";
import {
  runCollectionDetailMutationAttempt,
  type CollectionDetailMutationDispatch,
  type CollectionDetailMutationHapticSender,
} from "./library-collection-detail-mutation-runtime-service";
import type { LibraryCollectionDetailKind } from "./library-collection-kind-service";
import {
  getCollectionSongMoveFinishCommand,
  getCollectionSongMoveStartCommand,
  getCollectionSongMoveSuccessCommand,
  getCollectionSongRemovalFinishCommand,
  getCollectionSongRemovalStartCommand,
  getCollectionSongRemovalSuccessCommand,
} from "./library-collection-mutation-service";

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
  sendHaptic: CollectionDetailMutationHapticSender;
  songId: number;
}) => {
  await runCollectionDetailMutationAttempt({
    dispatch,
    finishAction: getCollectionSongMoveFinishCommand().action,
    mutation: "move-song",
    onSuccess: () => {
      sendHaptic(getCollectionSongMoveSuccessCommand().haptic);
    },
    run: () =>
      moveLibraryCollectionSong({
        collectionId,
        direction,
        kind,
        songId,
        songs: detail.songs,
      }),
    sendHaptic,
    startAction: getCollectionSongMoveStartCommand(songId).action,
  });
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
  sendHaptic: CollectionDetailMutationHapticSender;
  songId: number;
}) => {
  await runCollectionDetailMutationAttempt({
    dispatch,
    finishAction: getCollectionSongRemovalFinishCommand().action,
    mutation: "remove-song",
    onSuccess: () => {
      sendHaptic(getCollectionSongRemovalSuccessCommand().haptic);
    },
    run: () =>
      removeLibraryCollectionSong({
        collectionId,
        kind,
        songId,
      }),
    sendHaptic,
    startAction: getCollectionSongRemovalStartCommand(songId).action,
  });
};
