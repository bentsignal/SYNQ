import { useRouter } from "expo-router";
import { useHapticFeedback } from "@/src/features/settings/hooks/use-haptic-feedback";
import {
  createAlbum,
  createArtistWithImage,
  createPlaylist,
} from "../repository/collection-repository";
import { useCollectionFormImageCommand } from "./use-collection-form-image-command";
import { createCollectionFromForm } from "../services/collection-form-mutation-service";
import {
  getCollectionDetailHref,
  getCollectionFormErrorMessage,
  type CollectionFormAction,
  type CollectionFormKind,
  type CollectionFormState,
} from "../services/collection-form-service";

type CreateCollectionFormCommandsCopy = {
  kicker: string;
};

type UseCreateCollectionFormCommandsParams = {
  canSave: boolean;
  copy: CreateCollectionFormCommandsCopy;
  dispatchFormState: React.Dispatch<CollectionFormAction>;
  formState: CollectionFormState;
  kind: CollectionFormKind;
};

export function useCreateCollectionFormCommands({
  canSave,
  copy,
  dispatchFormState,
  formState,
  kind,
}: UseCreateCollectionFormCommandsParams) {
  const router = useRouter();
  const { sendHaptic } = useHapticFeedback();
  const pickImage = useCollectionFormImageCommand({
    dispatchFormState,
    sendHaptic,
  });

  const create = async () => {
    if (!canSave) {
      sendHaptic("error");
      dispatchFormState({
        error: `${copy.kicker} name is required.`,
        type: "fail",
      });
      return;
    }

    dispatchFormState({ type: "begin-save" });

    try {
      const collection = await createCollectionFromForm({
        imageDataUrl: formState.image?.dataUrl,
        kind,
        name: formState.name,
        repository: {
          createAlbum,
          createArtistWithImage,
          createPlaylist,
        },
        year: formState.year,
      });
      sendHaptic("success");
      router.replace(getCollectionDetailHref({ id: collection.id, kind }));
    } catch (caughtError) {
      sendHaptic("error");
      dispatchFormState({
        error: getCollectionFormErrorMessage({
          caughtError,
          fallbackMessage: `${copy.kicker} could not be created.`,
        }),
        type: "fail",
      });
    } finally {
      dispatchFormState({ type: "finish-save" });
    }
  };

  return {
    create,
    pickImage,
  };
}
