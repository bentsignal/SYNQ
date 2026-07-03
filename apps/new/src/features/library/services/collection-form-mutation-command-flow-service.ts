import type { HapticFeedbackType } from "../../settings/services/haptic-feedback-service";
import type { CollectionDetailHref } from "./collection-form-navigation-service";
import {
  getCollectionFormBeginSaveCommand,
  getCollectionFormBlockedSaveCommand,
  getCollectionFormFailureCommand,
  getCollectionFormSuccessCommand,
} from "./collection-form-command-state-service";
import type { CollectionFormKind } from "./collection-form-domain-service";
import type {
  CollectionFormAction,
  CollectionFormState,
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

  dispatch(getCollectionFormBeginSaveCommand().action);

  try {
    const collection = await createCollectionFromForm({
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
    replaceRoute(command.href);
  } catch (caughtError) {
    const command = getCollectionFormFailureCommand({
      caughtError,
      kind,
      operation: "create",
    });
    sendHaptic(command.haptic);
    dispatch(command.action);
  } finally {
    dispatch({ type: "finish-save" });
  }
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

  dispatch(getCollectionFormBeginSaveCommand().action);

  try {
    await updateCollectionFromForm({
      artistNames: formState.artistNames,
      id,
      imageDataUrl: formState.image?.dataUrl,
      kind,
      name: formState.name,
      year: formState.year,
    });
    const command = getCollectionFormSuccessCommand({ id, kind });
    sendHaptic(command.haptic);
    replaceRoute(command.href);
  } catch (caughtError) {
    const command = getCollectionFormFailureCommand({
      caughtError,
      kind,
      operation: "update",
    });
    sendHaptic(command.haptic);
    dispatch(command.action);
  } finally {
    dispatch({ type: "finish-save" });
  }
};
