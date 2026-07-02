import { Alert } from "react-native";
import { router } from "expo-router";
import { shareLibrarySongs } from "@/src/features/export/services/library-export-service";
import { useHapticFeedback } from "@/src/features/settings/hooks/use-haptic-feedback";
import { deleteCollection } from "../repository/collection-delete-repository";
import type {
  LibraryCollectionDetail,
  LibraryCollectionDetailKind,
} from "../services/library-collection-detail-service";
import {
  getCollectionDetailMutationErrorMessage,
  getCollectionListHref,
  getDeleteCollectionConfirmationCopy,
  type CollectionDetailActionState,
  type CollectionDetailMutationAction,
} from "../services/library-collection-interaction-service";

type CollectionDetailMutationDispatch = (
  action: CollectionDetailMutationAction,
) => void;

type UseLibraryCollectionCollectionMutationsParams = {
  actionState: CollectionDetailActionState;
  detail: LibraryCollectionDetail;
  dispatchMutation: CollectionDetailMutationDispatch;
  id: number;
  kind: LibraryCollectionDetailKind;
};

export function useLibraryCollectionCollectionMutations({
  actionState,
  detail,
  dispatchMutation,
  id,
  kind,
}: UseLibraryCollectionCollectionMutationsParams) {
  const { sendHaptic } = useHapticFeedback();

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

  return {
    deleteCurrentCollection,
    exportCollection,
  };
}
