import { useHapticFeedback } from "@/src/features/settings/hooks/use-haptic-feedback";
import {
  moveLibraryCollectionSongCommand,
  removeLibraryCollectionSongCommand,
} from "../services/library-collection-command-service";
import type { LibraryCollectionDetail } from "../services/library-collection-detail-service";
import type { LibraryCollectionDetailKind } from "../services/library-collection-kind-service";
import {
  getCollectionDetailMutationFailureCommand,
  getCollectionSongMoveFinishCommand,
  getCollectionSongMoveStartCommand,
  getCollectionSongMoveSuccessCommand,
  getCollectionSongRemovalFinishCommand,
  getCollectionSongRemovalStartCommand,
  getCollectionSongRemovalSuccessCommand,
} from "../services/library-collection-mutation-service";
import type { CollectionDetailMutationAction } from "../services/library-collection-mutation-state-service";

type CollectionDetailMutationDispatch = (
  action: CollectionDetailMutationAction,
) => void;

type UseLibraryCollectionSongMutationsParams = {
  detail: LibraryCollectionDetail;
  dispatchMutation: CollectionDetailMutationDispatch;
  id: number;
  kind: LibraryCollectionDetailKind;
};

export function useLibraryCollectionSongMutations({
  detail,
  dispatchMutation,
  id,
  kind,
}: UseLibraryCollectionSongMutationsParams) {
  const { sendHaptic } = useHapticFeedback();

  const moveSong = async (songId: number, direction: "down" | "up") => {
    dispatchMutation(getCollectionSongMoveStartCommand(songId).action);

    try {
      await moveLibraryCollectionSongCommand({
        collectionId: id,
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
      dispatchMutation(command.action);
    } finally {
      dispatchMutation(getCollectionSongMoveFinishCommand().action);
    }
  };

  const removeSong = async (songId: number) => {
    dispatchMutation(getCollectionSongRemovalStartCommand(songId).action);

    try {
      await removeLibraryCollectionSongCommand({
        collectionId: id,
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
      dispatchMutation(command.action);
    } finally {
      dispatchMutation(getCollectionSongRemovalFinishCommand().action);
    }
  };

  return {
    moveSong,
    removeSong,
  };
}
