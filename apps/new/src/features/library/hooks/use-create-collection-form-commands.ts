import { replaceNativeRoute } from "@/src/features/app-shell/services/native-route-service";
import { useHapticFeedback } from "@/src/features/settings/hooks/use-haptic-feedback";
import { useCollectionFormImageCommand } from "./use-collection-form-image-command";
import { createCollectionFromFormCommand } from "../services/collection-form-command-service";
import {
  getCollectionFormBeginSaveCommand,
  getCollectionFormBlockedSaveCommand,
  getCollectionFormFailureCommand,
  getCollectionFormSuccessCommand,
} from "../services/collection-form-command-state-service";
import {
  type CollectionFormAction,
  type CollectionFormKind,
  type CollectionFormState,
} from "../services/collection-form-service";

type UseCreateCollectionFormCommandsParams = {
  canSave: boolean;
  dispatchFormState: React.Dispatch<CollectionFormAction>;
  formState: CollectionFormState;
  kind: CollectionFormKind;
};

export function useCreateCollectionFormCommands({
  canSave,
  dispatchFormState,
  formState,
  kind,
}: UseCreateCollectionFormCommandsParams) {
  const { sendHaptic } = useHapticFeedback();
  const pickImage = useCollectionFormImageCommand({
    dispatchFormState,
    sendHaptic,
  });

  const create = async () => {
    if (!canSave) {
      const command = getCollectionFormBlockedSaveCommand(kind);
      sendHaptic(command.haptic);
      dispatchFormState(command.action);
      return;
    }

    dispatchFormState(getCollectionFormBeginSaveCommand().action);

    try {
      const collection = await createCollectionFromFormCommand({
        imageDataUrl: formState.image?.dataUrl,
        kind,
        name: formState.name,
        year: formState.year,
      });
      const command = getCollectionFormSuccessCommand({
        id: collection.id,
        kind,
      });
      sendHaptic(command.haptic);
      replaceNativeRoute(command.href);
    } catch (caughtError) {
      const command = getCollectionFormFailureCommand({
        caughtError,
        kind,
        operation: "create",
      });
      sendHaptic(command.haptic);
      dispatchFormState(command.action);
    } finally {
      dispatchFormState({ type: "finish-save" });
    }
  };

  return {
    create,
    pickImage,
  };
}
