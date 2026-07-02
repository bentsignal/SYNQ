import { Alert } from "react-native";
import { router } from "expo-router";
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

type HapticSender = (type: "error" | "success") => void;

export function useLibraryCollectionDeleteCommand({
  actionState,
  detail,
  dispatchMutation,
  id,
  kind,
  sendHaptic,
}: {
  actionState: CollectionDetailActionState;
  detail: LibraryCollectionDetail;
  dispatchMutation: CollectionDetailMutationDispatch;
  id: number;
  kind: LibraryCollectionDetailKind;
  sendHaptic: HapticSender;
}) {
  return () => {
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
}
