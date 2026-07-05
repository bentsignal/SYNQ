import { getAddCollectionSongsToggleSelectionCommand } from "./add-collection-songs-command-state-service";
import type { AddCollectionSongsFlowDependencies } from "./add-collection-songs-mutation-runtime-service";

export const runAddCollectionSongsToggleSelectionCommand = ({
  dispatchControllerState,
  sendHaptic,
  songId,
}: AddCollectionSongsFlowDependencies & {
  songId: number;
}) => {
  const command = getAddCollectionSongsToggleSelectionCommand(songId);
  sendHaptic(command.haptic);
  dispatchControllerState(command.action);
};
