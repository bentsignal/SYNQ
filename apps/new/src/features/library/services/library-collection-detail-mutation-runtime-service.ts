import type { HapticFeedbackType } from "../../settings/services/haptic-feedback-service";
import { getCollectionDetailMutationFailureCommand } from "./library-collection-mutation-service";
import type {
  CollectionDetailMutationAction,
  CollectionDetailMutationKind,
} from "./library-collection-mutation-state-service";

export type CollectionDetailMutationDispatch = (
  action: CollectionDetailMutationAction,
) => void;

export type CollectionDetailMutationHapticSender = (
  type: HapticFeedbackType,
) => void;

export type NativeConfirmationPresenter = (params: {
  body: string;
  cancelLabel: string;
  confirmLabel: string;
  onConfirm: () => Promise<void> | void;
  title: string;
}) => void;

export type NativeRouteReplacer = (href: string) => void;

export const runCollectionDetailMutationAttempt = async ({
  dispatch,
  finishAction,
  mutation,
  onSuccess,
  run,
  sendHaptic,
  startAction,
}: {
  dispatch: CollectionDetailMutationDispatch;
  finishAction: CollectionDetailMutationAction;
  mutation: CollectionDetailMutationKind;
  onSuccess: () => void;
  run: () => Promise<void>;
  sendHaptic: CollectionDetailMutationHapticSender;
  startAction: CollectionDetailMutationAction;
}) => {
  dispatch(startAction);

  try {
    await run();
    onSuccess();
  } catch (caughtError) {
    const command = getCollectionDetailMutationFailureCommand({
      caughtError,
      mutation,
    });
    sendHaptic(command.haptic);
    dispatch(command.action);
  } finally {
    dispatch(finishAction);
  }
};
