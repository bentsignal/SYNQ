import { useCallback, useMemo, useState } from "react";
import { router } from "expo-router";
import { Alert } from "react-native";
import { shareLibrarySongs } from "@/src/features/export/services/library-export-service";
import { usePlaybackSession } from "@/src/features/playback/hooks/use-playback-session";
import { useHapticFeedback } from "@/src/features/settings/hooks/use-haptic-feedback";
import {
  deleteLibrarySong,
  setLibrarySongLiked,
} from "../repository/song-metadata-repository";
import {
  getLibrarySongDetailActionState,
  getLibrarySongDetailPlayerHref,
  getLibrarySongDetailMutationErrorMessage,
  getLibrarySongDeleteConfirmationCopy,
  getLibrarySongDeleteSuccessHref,
  toLibrarySongDetailPlaybackItem,
  toLibrarySongExportItem,
  type LibrarySongDetail,
} from "../services/library-song-detail-service";

export function useLibrarySongDetailController({
  detail,
  songId,
}: {
  detail: LibrarySongDetail;
  songId: number;
}) {
  const { addToQueue, playSong, removeFromQueue } = usePlaybackSession();
  const { sendHaptic } = useHapticFeedback();
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isExporting, setIsExporting] = useState(false);
  const [isTogglingLiked, setIsTogglingLiked] = useState(false);
  const actionState = getLibrarySongDetailActionState({
    detail,
    isDeleting,
    isExporting,
    isTogglingLiked,
  });
  const playbackItem = useMemo(
    () => toLibrarySongDetailPlaybackItem({ detail, songId }),
    [detail, songId],
  );

  const playCurrentSong = useCallback(() => {
    if (!actionState.canPlay) {
      sendHaptic("error");
      return;
    }

    sendHaptic("light");
    playSong(playbackItem);
    router.push(getLibrarySongDetailPlayerHref());
  }, [actionState.canPlay, playSong, playbackItem, sendHaptic]);

  const queueCurrentSong = useCallback(() => {
    if (!actionState.canPlay) {
      sendHaptic("error");
      return;
    }

    sendHaptic("light");
    addToQueue(playbackItem);
  }, [actionState.canPlay, addToQueue, playbackItem, sendHaptic]);

  const toggleLiked = useCallback(async () => {
    if (!actionState.canToggleLiked) {
      sendHaptic("error");
      return;
    }

    setIsTogglingLiked(true);
    setError(null);

    try {
      await setLibrarySongLiked({
        liked: !detail.isLiked,
        songId,
      });
      sendHaptic("light");
    } catch (caughtError) {
      sendHaptic("error");
      setError(
        getLibrarySongDetailMutationErrorMessage({
          caughtError,
          mutation: "toggle-liked",
        }),
      );
    } finally {
      setIsTogglingLiked(false);
    }
  }, [actionState.canToggleLiked, detail.isLiked, sendHaptic, songId]);

  const exportCurrentSong = useCallback(async () => {
    if (!actionState.canExport) {
      sendHaptic("error");
      return;
    }

    setError(null);
    setIsExporting(true);

    try {
      await shareLibrarySongs([toLibrarySongExportItem({ detail, songId })]);
      sendHaptic("success");
    } catch (caughtError) {
      sendHaptic("error");
      setError(
        getLibrarySongDetailMutationErrorMessage({
          caughtError,
          mutation: "export-song",
        }),
      );
    } finally {
      setIsExporting(false);
    }
  }, [actionState.canExport, detail, sendHaptic, songId]);

  const deleteCurrentSong = useCallback(() => {
    if (!actionState.canDelete) {
      sendHaptic("error");
      return;
    }

    const confirmation = getLibrarySongDeleteConfirmationCopy(detail);

    Alert.alert(confirmation.title, confirmation.body, [
      { text: confirmation.cancelLabel, style: "cancel" },
      {
        onPress: async () => {
          setIsDeleting(true);
          setError(null);

          try {
            await deleteLibrarySong(songId);
            removeFromQueue(songId);
            sendHaptic("success");
            router.replace(getLibrarySongDeleteSuccessHref());
          } catch (caughtError) {
            sendHaptic("error");
            setError(
              getLibrarySongDetailMutationErrorMessage({
                caughtError,
                mutation: "delete-song",
              }),
            );
          } finally {
            setIsDeleting(false);
          }
        },
        style: "destructive",
        text: confirmation.confirmLabel,
      },
    ]);
  }, [
    actionState.canDelete,
    detail,
    removeFromQueue,
    sendHaptic,
    songId,
  ]);

  return {
    actionState,
    deleteCurrentSong,
    error,
    exportCurrentSong,
    playCurrentSong,
    queueCurrentSong,
    toggleLiked,
  };
}

export type LibrarySongDetailController = ReturnType<
  typeof useLibrarySongDetailController
>;
