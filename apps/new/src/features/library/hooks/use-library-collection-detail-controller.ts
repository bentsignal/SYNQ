import { useMemo, useReducer } from "react";
import { Alert } from "react-native";
import { router } from "expo-router";
import { shareLibrarySongs } from "@/src/features/export/services/library-export-service";
import { usePlaybackSession } from "@/src/features/playback/hooks/use-playback-session";
import { useHapticFeedback } from "@/src/features/settings/hooks/use-haptic-feedback";
import { deleteCollection } from "../repository/collection-delete-repository";
import {
  removeSongFromCollection,
  updateCollectionSongOrder,
} from "../repository/relationship-repository";
import {
  collectionDetailMutationReducer,
  getCollectionDetailActionState,
  getCollectionListHref,
  getCollectionPlaybackCommandPlan,
  getCollectionQueueCommandPlan,
  getCollectionDetailMutationErrorMessage,
  getCollectionSongOrderUpdate,
  getDeleteCollectionConfirmationCopy,
  initialCollectionDetailMutationState,
} from "../services/library-collection-interaction-service";
import type {
  LibraryCollectionDetail,
  LibraryCollectionDetailKind,
} from "../services/library-collection-detail-service";

type UseLibraryCollectionDetailControllerParams = {
  detail: LibraryCollectionDetail;
  id: number;
  kind: LibraryCollectionDetailKind;
};

export function useLibraryCollectionDetailController({
  detail,
  id,
  kind,
}: UseLibraryCollectionDetailControllerParams) {
  const { addToQueue, playSong } = usePlaybackSession();
  const { sendHaptic } = useHapticFeedback();
  const [mutationState, dispatchMutation] = useReducer(
    collectionDetailMutationReducer,
    initialCollectionDetailMutationState,
  );
  const actionState = useMemo(
    () =>
      getCollectionDetailActionState({
        id,
        isDeleting: mutationState.isDeleting,
        isExporting: mutationState.isExporting,
        isMissing: detail.isMissing,
        kind,
        songs: detail.songs,
      }),
    [
      detail.isMissing,
      detail.songs,
      id,
      kind,
      mutationState.isDeleting,
      mutationState.isExporting,
    ],
  );

  const playCollection = () => {
    const playbackPlan = getCollectionPlaybackCommandPlan({
      playableSongs: actionState.playableSongs,
    });

    sendHaptic(playbackPlan.haptic);

    if (!playbackPlan.firstSong || !playbackPlan.playerHref) {
      return;
    }

    playSong(playbackPlan.firstSong);
    playbackPlan.queuedSongs.forEach(addToQueue);
    router.push(playbackPlan.playerHref);
  };

  const queueCollection = () => {
    const queuePlan = getCollectionQueueCommandPlan({
      canQueue: actionState.canQueue,
      playableSongs: actionState.playableSongs,
    });

    sendHaptic(queuePlan.haptic);

    if (queuePlan.queuedSongs.length === 0) {
      return;
    }

    queuePlan.queuedSongs.forEach(addToQueue);
  };

  const exportCollection = async () => {
    if (!actionState.canExport) {
      sendHaptic("error");
      return;
    }

    dispatchMutation({ mutation: "export-collection", type: "begin" });

    try {
      await shareLibrarySongs(actionState.playableSongs);
      sendHaptic("success");
    } catch (caughtError) {
      sendHaptic("error");
      dispatchMutation({
        error: getCollectionDetailMutationErrorMessage({
          caughtError,
          mutation: "export-collection",
        }),
        type: "fail",
      });
    } finally {
      dispatchMutation({ mutation: "export-collection", type: "finish" });
    }
  };

  const deleteCurrentCollection = () => {
    if (!actionState.canDelete) {
      sendHaptic("error");
      return;
    }

    const confirmationCopy = getDeleteCollectionConfirmationCopy({
      eyebrow: detail.eyebrow,
      title: detail.title,
    });

    Alert.alert(
      confirmationCopy.title,
      confirmationCopy.message,
      [
        { style: "cancel", text: confirmationCopy.cancelLabel },
        {
          onPress: async () => {
            dispatchMutation({ mutation: "delete-collection", type: "begin" });

            try {
              await deleteCollection({ id, kind });
              sendHaptic("success");
              router.replace(getCollectionListHref(kind));
            } catch (caughtError) {
              sendHaptic("error");
              dispatchMutation({
                error: getCollectionDetailMutationErrorMessage({
                  caughtError,
                  mutation: "delete-collection",
                }),
                type: "fail",
              });
            } finally {
              dispatchMutation({
                mutation: "delete-collection",
                type: "finish",
              });
            }
          },
          style: "destructive",
          text: confirmationCopy.confirmLabel,
        },
      ],
    );
  };

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
    actionState,
    deleteCurrentCollection,
    exportCollection,
    moveSong,
    movingSongId: mutationState.movingSongId,
    mutationError: mutationState.mutationError,
    playCollection,
    queueCollection,
    removeSong,
    removingSongId: mutationState.removingSongId,
  };
}
