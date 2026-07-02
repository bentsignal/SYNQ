import { useCallback, useReducer } from "react";
import { Alert } from "react-native";
import { router } from "expo-router";
import { shareLibrarySongs } from "@/src/features/export/services/library-export-service";
import { usePlaybackSession } from "@/src/features/playback/hooks/use-playback-session";
import { useHapticFeedback } from "@/src/features/settings/hooks/use-haptic-feedback";
import {
  deleteLibrarySong,
  setLibrarySongLiked,
} from "../repository/song-metadata-repository";
import {
  getLibrarySongDeleteConfirmationCopy,
  getLibrarySongDeleteSuccessHref,
  getLibrarySongDetailActionState,
  getLibrarySongDetailMutationErrorMessage,
  initialLibrarySongDetailMutationState,
  librarySongDetailMutationReducer,
  toLibrarySongExportItem,
  type LibrarySongDetail,
} from "../services/library-song-detail-service";

type UseLibrarySongDetailMutationsParams = {
  detail: LibrarySongDetail;
  songId: number;
};

export function useLibrarySongDetailMutations({
  detail,
  songId,
}: UseLibrarySongDetailMutationsParams) {
  const { removeFromQueue } = usePlaybackSession();
  const { sendHaptic } = useHapticFeedback();
  const [mutationState, dispatchMutation] = useReducer(
    librarySongDetailMutationReducer,
    initialLibrarySongDetailMutationState,
  );
  const actionState = getLibrarySongDetailActionState({
    detail,
    isDeleting: mutationState.isDeleting,
    isExporting: mutationState.isExporting,
    isTogglingLiked: mutationState.isTogglingLiked,
  });

  const toggleLiked = useCallback(async () => {
    if (!actionState.canToggleLiked) {
      sendHaptic("error");
      return;
    }

    dispatchMutation({ mutation: "toggle-liked", type: "begin" });

    try {
      await setLibrarySongLiked({
        liked: !detail.isLiked,
        songId,
      });
      sendHaptic("light");
    } catch (caughtError) {
      sendHaptic("error");
      dispatchMutation({
        error: getLibrarySongDetailMutationErrorMessage({
          caughtError,
          mutation: "toggle-liked",
        }),
        type: "fail",
      });
    } finally {
      dispatchMutation({ mutation: "toggle-liked", type: "finish" });
    }
  }, [actionState.canToggleLiked, detail.isLiked, sendHaptic, songId]);

  const exportCurrentSong = useCallback(async () => {
    if (!actionState.canExport) {
      sendHaptic("error");
      return;
    }

    dispatchMutation({ mutation: "export-song", type: "begin" });

    try {
      await shareLibrarySongs([toLibrarySongExportItem({ detail, songId })]);
      sendHaptic("success");
    } catch (caughtError) {
      sendHaptic("error");
      dispatchMutation({
        error: getLibrarySongDetailMutationErrorMessage({
          caughtError,
          mutation: "export-song",
        }),
        type: "fail",
      });
    } finally {
      dispatchMutation({ mutation: "export-song", type: "finish" });
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
          dispatchMutation({ mutation: "delete-song", type: "begin" });

          try {
            await deleteLibrarySong(songId);
            removeFromQueue(songId);
            sendHaptic("success");
            router.replace(getLibrarySongDeleteSuccessHref());
          } catch (caughtError) {
            sendHaptic("error");
            dispatchMutation({
              error: getLibrarySongDetailMutationErrorMessage({
                caughtError,
                mutation: "delete-song",
              }),
              type: "fail",
            });
          } finally {
            dispatchMutation({ mutation: "delete-song", type: "finish" });
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
    error: mutationState.error,
    exportCurrentSong,
    toggleLiked,
  };
}
