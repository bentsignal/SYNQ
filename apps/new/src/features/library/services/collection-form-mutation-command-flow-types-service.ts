import type { CollectionFormKind } from "./collection-form-domain-service";
import type { CollectionFormState } from "./collection-form-state-service";
import type {
  CollectionFormCreateCommand,
  CollectionFormDispatch,
  CollectionFormHapticSender,
  CollectionFormRouteReplacer,
  CollectionFormUpdateCommand,
} from "./collection-form-mutation-runtime-service";

export type CreateCollectionFormSaveCommandParams = {
  canSave: boolean;
  createCollectionFromForm: CollectionFormCreateCommand;
  dispatch: CollectionFormDispatch;
  formState: CollectionFormState;
  kind: CollectionFormKind;
  replaceRoute: CollectionFormRouteReplacer;
  sendHaptic: CollectionFormHapticSender;
};

export type EditCollectionFormSaveCommandParams = {
  canSave: boolean;
  dispatch: CollectionFormDispatch;
  formState: CollectionFormState;
  id: number;
  kind: CollectionFormKind;
  replaceRoute: CollectionFormRouteReplacer;
  sendHaptic: CollectionFormHapticSender;
  updateCollectionFromForm: CollectionFormUpdateCommand;
};
