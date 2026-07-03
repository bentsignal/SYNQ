import { Alert } from "react-native";
import { router } from "expo-router";
import { deleteLibraryCollectionCommand } from "../services/library-collection-command-service";
import type { LibraryCollectionDetail } from "../services/library-collection-detail-service";
import type { LibraryCollectionDetailKind } from "../services/library-collection-kind-service";
import {
  getDeleteCollectionConfirmationCopy,
  type CollectionDetailActionState,
} from "../services/library-collection-interaction-service";
import { getCollectionListHref } from "../services/library-collection-navigation-service";
import {
  getCollectionDetailMutationErrorMessage,
  type CollectionDetailMutationAction,
} from "../services/library-collection-mutation-service";

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
              await deleteLibraryCollectionCommand({ id, kind });
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
