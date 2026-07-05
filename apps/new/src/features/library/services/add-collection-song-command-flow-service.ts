import type { LibraryCollectionDetailKind } from "./library-collection-kind-service";
import {
  getAddCollectionSongsSongStartCommand,
  getAddCollectionSongsSongSuccessCommand,
} from "./add-collection-songs-command-state-service";
import { getAddCollectionSongsFinishSongAction } from "./add-collection-songs-action-service";
import {
  runAddCollectionSongsMutationAttempt,
  type AddCollectionSongsFlowDependencies,
} from "./add-collection-songs-mutation-runtime-service";

type AddCollectionSongCommandParams = AddCollectionSongsFlowDependencies & {
  addCollectionSong: (params: {
    collectionId: number;
    kind: LibraryCollectionDetailKind;
    songId: number;
  }) => Promise<void>;
  collectionId: number;
  kind: LibraryCollectionDetailKind;
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
