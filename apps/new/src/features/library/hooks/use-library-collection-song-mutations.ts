import { useHapticFeedback } from "@/src/features/settings/hooks/use-haptic-feedback";
import {
  moveLibraryCollectionSongCommand,
  removeLibraryCollectionSongCommand,
} from "../services/library-collection-command-service";
import type { LibraryCollectionDetail } from "../services/library-collection-detail-service";
import type { LibraryCollectionDetailKind } from "../services/library-collection-kind-service";
import {
  runLibraryCollectionSongMoveCommand,
  runLibraryCollectionSongRemoveCommand,
} from "../services/library-collection-mutation-command-flow-service";
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
    await runLibraryCollectionSongMoveCommand({
      collectionId: id,
      detail,
      direction,
      dispatch: dispatchMutation,
      kind,
      moveLibraryCollectionSong: moveLibraryCollectionSongCommand,
      sendHaptic,
      songId,
    });
  };

  const removeSong = async (songId: number) => {
    await runLibraryCollectionSongRemoveCommand({
      collectionId: id,
      dispatch: dispatchMutation,
      kind,
      removeLibraryCollectionSong: removeLibraryCollectionSongCommand,
      sendHaptic,
      songId,
    });
  };

  return {
    moveSong,
    removeSong,
  };
}
