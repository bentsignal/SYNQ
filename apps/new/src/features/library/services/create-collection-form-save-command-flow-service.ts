import {
  runCollectionFormSaveAttempt,
} from "./collection-form-mutation-runtime-service";
import type {
  CreateCollectionFormSaveCommandParams,
} from "./collection-form-mutation-command-flow-types-service";
import {
  runCollectionFormBlockedSaveCommand,
  runCollectionFormSuccessCommand,
} from "./collection-form-save-command-action-service";

export const runCreateCollectionFormSaveCommand = async ({
  canSave,
  createCollectionFromForm,
  dispatch,
  formState,
  kind,
  replaceRoute,
  sendHaptic,
}: CreateCollectionFormSaveCommandParams) => {
  if (!canSave) {
    runCollectionFormBlockedSaveCommand({ dispatch, kind, sendHaptic });
    return;
  }

  await runCollectionFormSaveAttempt({
    dispatch,
    kind,
    onSuccess: (id) => {
      runCollectionFormSuccessCommand({
        id,
        kind,
        replaceRoute,
        sendHaptic,
      });
    },
    operation: "create",
    run: () =>
      createCollectionFromForm({
        imageDataUrl: formState.image?.dataUrl,
        kind,
        name: formState.name,
        year: formState.year,
      }),
    sendHaptic,
  });
};
