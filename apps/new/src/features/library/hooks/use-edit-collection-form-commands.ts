import { useRouter } from "expo-router";
import { useHapticFeedback } from "@/src/features/settings/hooks/use-haptic-feedback";
import { useCollectionFormImageCommand } from "./use-collection-form-image-command";
import { updateCollectionFromFormCommand } from "../services/collection-form-command-service";
import {
  getCollectionFormBeginSaveCommand,
  getCollectionFormBlockedSaveCommand,
  getCollectionFormFailureCommand,
  getCollectionFormSuccessCommand,
  type CollectionFormAction,
  type CollectionFormState,
} from "../services/collection-form-service";
import type { EditCollectionKind } from "../services/edit-collection-query-service";

type UseEditCollectionFormCommandsParams = {
  canSave: boolean;
  dispatchFormState: React.Dispatch<CollectionFormAction>;
  formState: CollectionFormState;
  id: number;
  kind: EditCollectionKind;
};

export function useEditCollectionFormCommands({
  canSave,
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
      const command = getCollectionFormBlockedSaveCommand(kind);
      sendHaptic(command.haptic);
      dispatchFormState(command.action);
      return;
    }

    dispatchFormState(getCollectionFormBeginSaveCommand().action);

    try {
      await updateCollectionFromFormCommand({
        artistNames: formState.artistNames,
        id,
        imageDataUrl: formState.image?.dataUrl,
        kind,
        name: formState.name,
        year: formState.year,
      });
      const command = getCollectionFormSuccessCommand({ id, kind });
      sendHaptic(command.haptic);
      router.replace(command.href);
    } catch (caughtError) {
      const command = getCollectionFormFailureCommand({
        caughtError,
        kind,
        operation: "update",
      });
      sendHaptic(command.haptic);
      dispatchFormState(command.action);
    } finally {
      dispatchFormState({ type: "finish-save" });
    }
  };

  return {
    pickImage,
    save,
  };
}
