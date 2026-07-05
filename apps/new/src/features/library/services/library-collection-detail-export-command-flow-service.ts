import type { CollectionDetailActionState } from "./library-collection-detail-action-state-service";
import {
  runCollectionDetailMutationAttempt,
  type CollectionDetailMutationDispatch,
  type CollectionDetailMutationHapticSender,
} from "./library-collection-detail-mutation-runtime-service";
import {
  getCollectionExportFinishCommand,
  getCollectionExportStartCommand,
  getCollectionExportSuccessCommand,
} from "./library-collection-mutation-collection-command-service";
import { getCollectionDetailMutationBlockedCommand } from "./library-collection-mutation-common-command-service";

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
  sendHaptic: CollectionDetailMutationHapticSender;
}) => {
  if (!actionState.canExport) {
    sendHaptic(getCollectionDetailMutationBlockedCommand().haptic);
    return;
  }

  await runCollectionDetailMutationAttempt({
    dispatch,
    finishAction: getCollectionExportFinishCommand().action,
    mutation: "export-collection",
    onSuccess: () => {
      sendHaptic(getCollectionExportSuccessCommand().haptic);
    },
    run: async () => {
      await exportLibraryCollection(actionState.playableSongs);
    },
    sendHaptic,
    startAction: getCollectionExportStartCommand().action,
  });
};
