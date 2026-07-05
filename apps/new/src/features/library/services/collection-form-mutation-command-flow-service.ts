import {
  getCollectionFormBlockedSaveCommand,
  getCollectionFormSuccessCommand,
} from "./collection-form-command-state-service";
import {
  runCollectionFormSaveAttempt,
} from "./collection-form-mutation-runtime-service";
import type {
  CreateCollectionFormSaveCommandParams,
  EditCollectionFormSaveCommandParams,
} from "./collection-form-mutation-command-flow-types-service";

export type {
  CreateCollectionFormSaveCommandParams,
  EditCollectionFormSaveCommandParams,
} from "./collection-form-mutation-command-flow-types-service";

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
    const command = getCollectionFormBlockedSaveCommand(kind);
    sendHaptic(command.haptic);
    dispatch(command.action);
    return;
  }

  await runCollectionFormSaveAttempt({
    dispatch,
    kind,
    onSuccess: (id) => {
      const command = getCollectionFormSuccessCommand({
        id,
        kind,
      });
      sendHaptic(command.haptic);
      replaceRoute(command.href);
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
    const command = getCollectionFormBlockedSaveCommand(kind);
    sendHaptic(command.haptic);
    dispatch(command.action);
    return;
  }

  await runCollectionFormSaveAttempt({
    dispatch,
    kind,
    onSuccess: (savedId) => {
      const command = getCollectionFormSuccessCommand({
        id: savedId,
        kind,
      });
      sendHaptic(command.haptic);
      replaceRoute(command.href);
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
