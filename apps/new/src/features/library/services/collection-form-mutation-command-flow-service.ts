import type { HapticFeedbackType } from "../../settings/services/haptic-feedback-service";
import type { CollectionDetailHref } from "./collection-form-navigation-service";
import {
  getCollectionFormBeginSaveCommand,
  getCollectionFormBlockedSaveCommand,
  getCollectionFormFailureCommand,
  getCollectionFormSuccessCommand,
} from "./collection-form-command-state-service";
import type { CollectionFormKind } from "./collection-form-domain-service";
import {
  getCollectionFormFinishSaveAction,
  type CollectionFormAction,
  type CollectionFormState,
} from "./collection-form-state-service";

type CollectionFormDispatch = (action: CollectionFormAction) => void;

type HapticSender = (type: HapticFeedbackType) => void;

type NativeRouteReplacer = (href: CollectionDetailHref) => void;

type CollectionFormCreateCommand = (params: {
  imageDataUrl?: string | null;
  kind: CollectionFormKind;
  name: string;
  year: string;
}) => Promise<{ id: number }>;

type CollectionFormUpdateCommand = (params: {
  artistNames?: string;
  id: number;
  imageDataUrl?: string | null;
  kind: CollectionFormKind;
  name: string;
  year: string;
}) => Promise<unknown>;

type CollectionFormSaveOperation = "create" | "update";

const runCollectionFormSaveAttempt = async ({
  dispatch,
  kind,
  onSuccess,
  operation,
  run,
  sendHaptic,
}: {
  dispatch: CollectionFormDispatch;
  kind: CollectionFormKind;
  onSuccess: (id: number) => void;
  operation: CollectionFormSaveOperation;
  run: () => Promise<{ id: number }>;
  sendHaptic: HapticSender;
}) => {
  dispatch(getCollectionFormBeginSaveCommand().action);

  try {
    const collection = await run();
    onSuccess(collection.id);
  } catch (caughtError) {
    const command = getCollectionFormFailureCommand({
      caughtError,
      kind,
      operation,
    });
    sendHaptic(command.haptic);
    dispatch(command.action);
  } finally {
    dispatch(getCollectionFormFinishSaveAction());
  }
};

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
  replaceRoute: NativeRouteReplacer;
  sendHaptic: HapticSender;
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
  replaceRoute: NativeRouteReplacer;
  sendHaptic: HapticSender;
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
