import { useHapticFeedback } from "@/src/features/settings/hooks/use-haptic-feedback";
import {
  removeSongFromCollection,
  updateCollectionSongOrder,
} from "../repository/relationship-repository";
import type {
  LibraryCollectionDetail,
  LibraryCollectionDetailKind,
} from "../services/library-collection-detail-service";
import {
  getCollectionDetailMutationErrorMessage,
  type CollectionDetailMutationAction,
} from "../services/library-collection-mutation-service";
import { getCollectionSongOrderUpdate } from "../services/library-collection-song-mutation-service";

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
    dispatchMutation({ mutation: "move-song", songId, type: "begin" });

    try {
      const orderUpdate = getCollectionSongOrderUpdate({
        direction,
        songId,
        songs: detail.songs,
      });

      await updateCollectionSongOrder({
        collectionId: id,
        kind,
        songIds: orderUpdate.songIds,
      });
      sendHaptic("light");
    } catch (caughtError) {
      sendHaptic("error");
      dispatchMutation({
        error: getCollectionDetailMutationErrorMessage({
          caughtError,
          mutation: "move-song",
        }),
        type: "fail",
      });
    } finally {
      dispatchMutation({ mutation: "move-song", type: "finish" });
    }
  };

  const removeSong = async (songId: number) => {
    dispatchMutation({ mutation: "remove-song", songId, type: "begin" });

    try {
      await removeSongFromCollection({
        collectionId: id,
        kind,
        songId,
      });
      sendHaptic("medium");
    } catch (caughtError) {
      sendHaptic("error");
      dispatchMutation({
        error: getCollectionDetailMutationErrorMessage({
          caughtError,
          mutation: "remove-song",
        }),
        type: "fail",
      });
    } finally {
      dispatchMutation({ mutation: "remove-song", type: "finish" });
    }
  };

  return {
    moveSong,
    removeSong,
  };
}
