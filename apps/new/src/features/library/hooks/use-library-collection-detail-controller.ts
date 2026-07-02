import { useMemo, useState } from "react";
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
  getCollectionDetailActionState,
  getCollectionListHref,
  getCollectionPlaybackCommandPlan,
  getCollectionQueueCommandPlan,
  getCollectionDetailMutationErrorMessage,
  getCollectionSongOrderUpdate,
  getDeleteCollectionConfirmationCopy,
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
  const [movingSongId, setMovingSongId] = useState<number | null>(null);
  const [removingSongId, setRemovingSongId] = useState<number | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [mutationError, setMutationError] = useState<string | null>(null);
  const actionState = useMemo(
    () =>
      getCollectionDetailActionState({
        id,
        isDeleting,
        isExporting,
        isMissing: detail.isMissing,
        kind,
        songs: detail.songs,
      }),
    [detail.isMissing, detail.songs, id, isDeleting, isExporting, kind],
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

    setIsExporting(true);
    setMutationError(null);

    try {
      await shareLibrarySongs(actionState.playableSongs);
      sendHaptic("success");
    } catch (caughtError) {
      sendHaptic("error");
      setMutationError(
        getCollectionDetailMutationErrorMessage({
          caughtError,
          mutation: "export-collection",
        }),
      );
    } finally {
      setIsExporting(false);
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
        { style: "cancel", text: "Cancel" },
        {
          onPress: async () => {
            setIsDeleting(true);
            setMutationError(null);

            try {
              await deleteCollection({ id, kind });
              sendHaptic("success");
              router.replace(getCollectionListHref(kind));
            } catch (caughtError) {
              sendHaptic("error");
              setMutationError(
                getCollectionDetailMutationErrorMessage({
                  caughtError,
                  mutation: "delete-collection",
                }),
              );
            } finally {
              setIsDeleting(false);
            }
          },
          style: "destructive",
          text: "Delete",
        },
      ],
    );
  };

  const moveSong = async (songId: number, direction: "down" | "up") => {
    setMovingSongId(songId);
    setMutationError(null);

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
      setMutationError(
        getCollectionDetailMutationErrorMessage({
          caughtError,
          mutation: "move-song",
        }),
      );
    } finally {
      setMovingSongId(null);
    }
  };

  const removeSong = async (songId: number) => {
    setRemovingSongId(songId);
    setMutationError(null);

    try {
      await removeSongFromCollection({
        collectionId: id,
        kind,
        songId,
      });
      sendHaptic("medium");
    } catch (caughtError) {
      sendHaptic("error");
      setMutationError(
        getCollectionDetailMutationErrorMessage({
          caughtError,
          mutation: "remove-song",
        }),
      );
    } finally {
      setRemovingSongId(null);
    }
  };

  return {
    actionState,
    deleteCurrentCollection,
    exportCollection,
    moveSong,
    movingSongId,
    mutationError,
    playCollection,
    queueCollection,
    removeSong,
    removingSongId,
  };
}
