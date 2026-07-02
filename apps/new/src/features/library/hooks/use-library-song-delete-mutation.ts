import { useCallback } from "react";
import { Alert } from "react-native";
import { router } from "expo-router";
import { useHapticFeedback } from "@/src/features/settings/hooks/use-haptic-feedback";
import { deleteLibrarySong } from "../repository/song-metadata-repository";
import {
  getLibrarySongDeleteConfirmationCopy,
  getLibrarySongDeleteSuccessHref,
  getLibrarySongDetailMutationErrorMessage,
  type LibrarySongDetail,
  type LibrarySongDetailActionState,
  type LibrarySongDetailMutationAction,
} from "../services/library-song-detail-service";

type LibrarySongDetailMutationDispatch = (
  action: LibrarySongDetailMutationAction,
) => void;

type UseLibrarySongDeleteMutationParams = {
  actionState: LibrarySongDetailActionState;
  detail: LibrarySongDetail;
  dispatchMutation: LibrarySongDetailMutationDispatch;
  removeFromQueue: (songId: number) => void;
  songId: number;
};

export function useLibrarySongDeleteMutation({
  actionState,
  detail,
  dispatchMutation,
  removeFromQueue,
  songId,
}: UseLibrarySongDeleteMutationParams) {
  const { sendHaptic } = useHapticFeedback();

  return useCallback(() => {
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
    dispatchMutation,
    removeFromQueue,
    sendHaptic,
    songId,
  ]);
}
