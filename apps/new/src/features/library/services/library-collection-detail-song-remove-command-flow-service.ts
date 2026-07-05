import type {
  CollectionSongCommandParams,
} from "./library-collection-command-dependencies-service";
import {
  runCollectionDetailMutationAttempt,
  type CollectionDetailMutationDispatch,
  type CollectionDetailMutationHapticSender,
} from "./library-collection-detail-mutation-runtime-service";
import {
  getCollectionSongRemovalFinishCommand,
  getCollectionSongRemovalStartCommand,
  getCollectionSongRemovalSuccessCommand,
} from "./library-collection-mutation-song-command-service";

export const runLibraryCollectionSongRemoveCommand = async ({
  collectionId,
  dispatch,
  kind,
  removeLibraryCollectionSong,
  sendHaptic,
  songId,
}: {
  collectionId: CollectionSongCommandParams["collectionId"];
  dispatch: CollectionDetailMutationDispatch;
  kind: CollectionSongCommandParams["kind"];
  removeLibraryCollectionSong: (
    params: CollectionSongCommandParams,
  ) => Promise<void>;
  sendHaptic: CollectionDetailMutationHapticSender;
  songId: CollectionSongCommandParams["songId"];
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
