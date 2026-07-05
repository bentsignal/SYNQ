import type {
  CollectionFormAction,
  CollectionFormImage,
} from "./collection-form-action-service";
import {
  reduceCollectionFormBeginSaveAction,
  reduceCollectionFormChangeFieldAction,
  reduceCollectionFormClearErrorAction,
  reduceCollectionFormFailAction,
  reduceCollectionFormFinishSaveAction,
  reduceCollectionFormHydrateAction,
  reduceCollectionFormPickImageAction,
} from "./collection-form-state-transition-service";

export {
  getCollectionFormChangeFieldAction,
  getCollectionFormFinishSaveAction,
  getCollectionFormHydrateAction,
  type CollectionFormAction,
  type CollectionFormField,
  type CollectionFormImage,
} from "./collection-form-action-service";

export type CollectionFormState = {
  artistNames: string;
  error: string | null;
  image: CollectionFormImage | null;
  isDirty: boolean;
  isSaving: boolean;
  name: string;
  year: string;
};

export const getInitialCollectionFormState = ({
  artistNames = "",
  name = "",
  year = "",
}: {
  artistNames?: string;
  name?: string;
  year?: string;
} = {}): CollectionFormState => ({
  artistNames,
  error: null,
  image: null,
  isDirty: false,
  isSaving: false,
  name,
  year,
});

export const collectionFormReducer = (
  state: CollectionFormState,
  action: CollectionFormAction,
): CollectionFormState => {
  switch (action.type) {
    case "hydrate":
      return reduceCollectionFormHydrateAction(state, action);
    case "change-field":
      return reduceCollectionFormChangeFieldAction(state, action);
    case "pick-image":
      return reduceCollectionFormPickImageAction(state, action);
    case "fail":
      return reduceCollectionFormFailAction(state, action);
    case "begin-save":
      return reduceCollectionFormBeginSaveAction(state);
    case "finish-save":
      return reduceCollectionFormFinishSaveAction(state);
    case "clear-error":
      return reduceCollectionFormClearErrorAction(state);
  }
};
