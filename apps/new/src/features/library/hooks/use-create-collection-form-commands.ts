import { replaceNativeRoute } from "@/src/features/app-shell/services/native-route-service";
import { useHapticFeedback } from "@/src/features/settings/hooks/use-haptic-feedback";
import { useCollectionFormImageCommand } from "./use-collection-form-image-command";
import { createCollectionFromFormCommand } from "../services/collection-form-command-service";
import { runCreateCollectionFormSaveCommand } from "../services/collection-form-mutation-command-flow-service";
import {
  type CollectionFormAction,
} from "../services/collection-form-action-service";
import {
  type CollectionFormState,
} from "../services/collection-form-state-service";
import type { CollectionFormKind } from "../services/collection-form-domain-service";

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
    await runCreateCollectionFormSaveCommand({
      canSave,
      createCollectionFromForm: createCollectionFromFormCommand,
      dispatch: dispatchFormState,
      formState,
      kind,
      replaceRoute: replaceNativeRoute,
      sendHaptic,
    });
  };

  return {
    create,
    pickImage,
  };
}
