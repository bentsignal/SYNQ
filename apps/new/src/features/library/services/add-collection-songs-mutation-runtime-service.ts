import type { HapticFeedbackType } from "../../settings/services/haptic-feedback-service";
import { getAddCollectionSongsFailureCommand } from "./add-collection-songs-command-state-service";
import type {
  AddCollectionSongsControllerAction,
  AddCollectionSongsMutationKind,
} from "./add-collection-songs-action-service";

export type AddCollectionSongsControllerDispatch = (
  action: AddCollectionSongsControllerAction,
) => void;

export type AddCollectionSongsHapticSender = (
  haptic: HapticFeedbackType,
) => void;

export type AddCollectionSongsFlowDependencies = {
  dispatchControllerState: AddCollectionSongsControllerDispatch;
  sendHaptic: AddCollectionSongsHapticSender;
};

export type AddCollectionSongsActionCommand = {
  action: AddCollectionSongsControllerAction;
  haptic: HapticFeedbackType;
};

export const runAddCollectionSongsMutationAttempt = async ({
  dispatchControllerState,
  finishAction,
  mutation,
  run,
  sendHaptic,
  startCommand,
  successCommand,
}: AddCollectionSongsFlowDependencies & {
  finishAction: AddCollectionSongsControllerAction;
  mutation: AddCollectionSongsMutationKind;
  run: () => Promise<void>;
  startCommand: AddCollectionSongsActionCommand;
  successCommand: AddCollectionSongsActionCommand;
}) => {
  sendHaptic(startCommand.haptic);
  dispatchControllerState(startCommand.action);

  try {
    await run();
    dispatchControllerState(successCommand.action);
    sendHaptic(successCommand.haptic);
  } catch (caughtError) {
    const command = getAddCollectionSongsFailureCommand({
      caughtError,
      mutation,
    });
    sendHaptic(command.haptic);
    dispatchControllerState(command.action);
  } finally {
    dispatchControllerState(finishAction);
  }
};
