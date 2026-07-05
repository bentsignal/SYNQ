import {
  runCollectionFormSaveAttempt,
} from "./collection-form-mutation-runtime-service";
import type {
  EditCollectionFormSaveCommandParams,
} from "./collection-form-mutation-command-flow-types-service";
import {
  runCollectionFormBlockedSaveCommand,
  runCollectionFormSuccessCommand,
} from "./collection-form-save-command-action-service";

export const runEditCollectionFormSaveCommand = async ({
  canSave,
  dispatch,
  formState,
  id,
  kind,
  replaceRoute,
  sendHaptic,
  updateCollectionFromForm,
}: EditCollectionFormSaveCommandParams) => {
  if (!canSave) {
    runCollectionFormBlockedSaveCommand({ dispatch, kind, sendHaptic });
    return;
  }

  await runCollectionFormSaveAttempt({
    dispatch,
    kind,
    onSuccess: (savedId) => {
      runCollectionFormSuccessCommand({
        id: savedId,
        kind,
        replaceRoute,
        sendHaptic,
      });
    },
    operation: "update",
    run: async () => {
      await updateCollectionFromForm({
        artistNames: formState.artistNames,
        id,
        imageDataUrl: formState.image?.dataUrl,
        kind,
        name: formState.name,
        year: formState.year,
      });
      return { id };
    },
    sendHaptic,
  });
};
