import {
  getCollectionFormBlockedSaveCommand,
  getCollectionFormSuccessCommand,
} from "./collection-form-command-state-service";
import type { CollectionFormKind } from "./collection-form-domain-service";
import {
  type CollectionFormState,
} from "./collection-form-state-service";
import {
  runCollectionFormSaveAttempt,
  type CollectionFormCreateCommand,
  type CollectionFormDispatch,
  type CollectionFormHapticSender,
  type CollectionFormRouteReplacer,
  type CollectionFormUpdateCommand,
} from "./collection-form-mutation-runtime-service";

export const runCreateCollectionFormSaveCommand = async ({
  canSave,
  createCollectionFromForm,
  dispatch,
  formState,
  kind,
  replaceRoute,
  sendHaptic,
}: {
  canSave: boolean;
  createCollectionFromForm: CollectionFormCreateCommand;
  dispatch: CollectionFormDispatch;
  formState: CollectionFormState;
  kind: CollectionFormKind;
  replaceRoute: CollectionFormRouteReplacer;
  sendHaptic: CollectionFormHapticSender;
}) => {
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
}: {
  canSave: boolean;
  dispatch: CollectionFormDispatch;
  formState: CollectionFormState;
  id: number;
  kind: CollectionFormKind;
  replaceRoute: CollectionFormRouteReplacer;
  sendHaptic: CollectionFormHapticSender;
  updateCollectionFromForm: CollectionFormUpdateCommand;
}) => {
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
