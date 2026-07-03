import { replaceNativeRoute } from "@/src/features/app-shell/services/native-route-service";
import { useHapticFeedback } from "@/src/features/settings/hooks/use-haptic-feedback";
import { useCollectionFormImageCommand } from "./use-collection-form-image-command";
import { updateCollectionFromFormCommand } from "../services/collection-form-command-service";
import { runEditCollectionFormSaveCommand } from "../services/collection-form-mutation-command-flow-service";
import {
  type CollectionFormAction,
  type CollectionFormState,
} from "../services/collection-form-state-service";
import type { EditCollectionKind } from "../services/edit-collection-state-service";

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
  const { sendHaptic } = useHapticFeedback();
  const pickImage = useCollectionFormImageCommand({
    dispatchFormState,
    sendHaptic,
  });

  const save = async () => {
    await runEditCollectionFormSaveCommand({
      canSave,
      dispatch: dispatchFormState,
      formState,
      id,
      kind,
      replaceRoute: replaceNativeRoute,
      sendHaptic,
      updateCollectionFromForm: updateCollectionFromFormCommand,
    });
  };

  return {
    pickImage,
    save,
  };
}
