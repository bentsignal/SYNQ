import type {
  MoveLibraryCollectionSongCommandParams,
} from "./library-collection-command-dependencies-service";
import type {
  LibraryCollectionDetail,
} from "./library-collection-detail-service";
import {
  runCollectionDetailMutationAttempt,
  type CollectionDetailMutationDispatch,
  type CollectionDetailMutationHapticSender,
} from "./library-collection-detail-mutation-runtime-service";
import {
  getCollectionSongMoveFinishCommand,
  getCollectionSongMoveStartCommand,
  getCollectionSongMoveSuccessCommand,
} from "./library-collection-mutation-song-command-service";

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
  collectionId: MoveLibraryCollectionSongCommandParams["collectionId"];
  detail: Pick<LibraryCollectionDetail, "songs">;
  direction: MoveLibraryCollectionSongCommandParams["direction"];
  dispatch: CollectionDetailMutationDispatch;
  kind: MoveLibraryCollectionSongCommandParams["kind"];
  moveLibraryCollectionSong: (
    params: MoveLibraryCollectionSongCommandParams,
  ) => Promise<void>;
  sendHaptic: CollectionDetailMutationHapticSender;
  songId: MoveLibraryCollectionSongCommandParams["songId"];
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
