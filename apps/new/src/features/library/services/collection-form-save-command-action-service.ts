import {
  getCollectionFormBlockedSaveCommand,
  getCollectionFormSuccessCommand,
} from "./collection-form-command-state-service";
import type { CollectionFormKind } from "./collection-form-domain-service";
import type {
  CollectionFormDispatch,
  CollectionFormHapticSender,
  CollectionFormRouteReplacer,
} from "./collection-form-mutation-runtime-service";

export const runCollectionFormBlockedSaveCommand = ({
  dispatch,
  kind,
  sendHaptic,
}: {
  dispatch: CollectionFormDispatch;
  kind: CollectionFormKind;
  sendHaptic: CollectionFormHapticSender;
}) => {
  const command = getCollectionFormBlockedSaveCommand(kind);
  sendHaptic(command.haptic);
  dispatch(command.action);
};

export const runCollectionFormSuccessCommand = ({
  id,
  kind,
  replaceRoute,
  sendHaptic,
}: {
  id: number;
  kind: CollectionFormKind;
  replaceRoute: CollectionFormRouteReplacer;
  sendHaptic: CollectionFormHapticSender;
}) => {
  const command = getCollectionFormSuccessCommand({
    id,
    kind,
  });
  sendHaptic(command.haptic);
  replaceRoute(command.href);
};
