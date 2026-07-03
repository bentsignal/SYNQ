import type { HapticFeedbackType } from "../../settings/services/haptic-feedback-service";
import {
  getLibrarySongDetailMutationFailureCommand,
  getLibrarySongDetailMutationFinishCommand,
  getLibrarySongDetailMutationStartCommand,
} from "./library-song-detail-mutation-command-state-service";
import type { LibrarySongDetailHref } from "./library-song-interaction-service";
import type {
  LibrarySongDetailMutationAction,
  LibrarySongDetailMutationKind,
} from "./library-song-detail-mutation-service";

export type LibrarySongDetailMutationDispatch = (
  action: LibrarySongDetailMutationAction,
) => void;

export type LibrarySongDetailMutationHapticSender = (
  type: HapticFeedbackType,
) => void;

export type NativeSongDeleteConfirmationPresenter = (params: {
  body: string;
  cancelLabel: string;
  confirmLabel: string;
  onConfirm: () => Promise<void> | void;
  title: string;
}) => void;

export type NativeSongDetailRouteReplacer = (
  href: LibrarySongDetailHref,
) => void;

export const runLibrarySongDetailMutationAttempt = async ({
  dispatch,
  mutation,
  onSuccess,
  run,
  sendHaptic,
}: {
  dispatch: LibrarySongDetailMutationDispatch;
  mutation: LibrarySongDetailMutationKind;
  onSuccess: () => void;
  run: () => Promise<unknown>;
  sendHaptic: LibrarySongDetailMutationHapticSender;
}) => {
  dispatch(getLibrarySongDetailMutationStartCommand(mutation).action);

  try {
    await run();
    onSuccess();
  } catch (caughtError) {
    const command = getLibrarySongDetailMutationFailureCommand({
      caughtError,
      mutation,
    });
    sendHaptic(command.haptic);
    dispatch(command.action);
  } finally {
    dispatch(getLibrarySongDetailMutationFinishCommand(mutation).action);
  }
};
