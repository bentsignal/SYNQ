import { useRouter } from "expo-router";
import { useHapticFeedback } from "@/src/features/settings/hooks/use-haptic-feedback";
import { useCollectionFormImageCommand } from "./use-collection-form-image-command";
import { updateCollectionFromFormCommand } from "../services/collection-form-command-service";
import { getCollectionDetailHref } from "../services/collection-form-navigation-service";
import {
  getCollectionFormErrorMessage,
  type CollectionFormAction,
  type CollectionFormState,
} from "../services/collection-form-service";
import type { EditCollectionKind } from "../services/edit-collection-query-service";

type EditCollectionFormCommandsCopy = {
  kicker: string;
};

type UseEditCollectionFormCommandsParams = {
  canSave: boolean;
  copy: EditCollectionFormCommandsCopy;
  dispatchFormState: React.Dispatch<CollectionFormAction>;
  formState: CollectionFormState;
  id: number;
  kind: EditCollectionKind;
};

export function useEditCollectionFormCommands({
  canSave,
  copy,
  dispatchFormState,
  formState,
  id,
  kind,
}: UseEditCollectionFormCommandsParams) {
  const router = useRouter();
  const { sendHaptic } = useHapticFeedback();
  const pickImage = useCollectionFormImageCommand({
    dispatchFormState,
    sendHaptic,
  });

  const save = async () => {
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
      await updateCollectionFromFormCommand({
        id,
        imageDataUrl: formState.image?.dataUrl,
        kind,
        name: formState.name,
        year: formState.year,
      });
      sendHaptic("success");
      router.replace(getCollectionDetailHref({ id, kind }));
    } catch (caughtError) {
      sendHaptic("error");
      dispatchFormState({
        error: getCollectionFormErrorMessage({
          caughtError,
          fallbackMessage: `${copy.kicker} could not be updated.`,
        }),
        type: "fail",
      });
    } finally {
      dispatchFormState({ type: "finish-save" });
    }
  };

  return {
    pickImage,
    save,
  };
}
