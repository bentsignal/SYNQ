import type { HapticFeedbackType } from "../../settings/services/haptic-feedback-service";
import type { CollectionDetailHref } from "./collection-form-navigation-service";
import {
  getCollectionFormBeginSaveCommand,
  getCollectionFormFailureCommand,
} from "./collection-form-command-state-service";
import type { CollectionFormKind } from "./collection-form-domain-service";
import {
  getCollectionFormFinishSaveAction,
  type CollectionFormAction,
} from "./collection-form-state-service";

export type CollectionFormDispatch = (action: CollectionFormAction) => void;

export type CollectionFormHapticSender = (
  type: HapticFeedbackType,
) => void;

export type CollectionFormRouteReplacer = (
  href: CollectionDetailHref,
) => void;

export type CollectionFormSaveOperation = "create" | "update";

export type CollectionFormCreateCommand = (params: {
  imageDataUrl?: string | null;
  kind: CollectionFormKind;
  name: string;
  year: string;
}) => Promise<{ id: number }>;

export type CollectionFormUpdateCommand = (params: {
  artistNames?: string;
  id: number;
  imageDataUrl?: string | null;
  kind: CollectionFormKind;
  name: string;
  year: string;
}) => Promise<unknown>;

export const runCollectionFormSaveAttempt = async ({
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
  sendHaptic: CollectionFormHapticSender;
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
