import type { CollectionFormAction } from "./collection-form-action-service";
import type {
  CollectionFormState,
} from "./collection-form-state-service";

type CollectionFormHydrateAction = Extract<
  CollectionFormAction,
  { type: "hydrate" }
>;
type CollectionFormChangeFieldAction = Extract<
  CollectionFormAction,
  { type: "change-field" }
>;
type CollectionFormPickImageAction = Extract<
  CollectionFormAction,
  { type: "pick-image" }
>;
type CollectionFormFailAction = Extract<CollectionFormAction, { type: "fail" }>;

export const reduceCollectionFormHydrateAction = (
  state: CollectionFormState,
  action: CollectionFormHydrateAction,
): CollectionFormState => {
  if (state.isDirty) {
    return state;
  }

  return {
    ...state,
    artistNames: action.artistNames,
    name: action.name,
    year: action.year,
  };
};

export const reduceCollectionFormChangeFieldAction = (
  state: CollectionFormState,
  action: CollectionFormChangeFieldAction,
): CollectionFormState => ({
  ...state,
  [action.field]: action.value,
  error: null,
  isDirty: true,
});

export const reduceCollectionFormPickImageAction = (
  state: CollectionFormState,
  action: CollectionFormPickImageAction,
): CollectionFormState => ({
  ...state,
  error: null,
  image: action.image,
  isDirty: true,
});

export const reduceCollectionFormFailAction = (
  state: CollectionFormState,
  action: CollectionFormFailAction,
): CollectionFormState => ({
  ...state,
  error: action.error,
});

export const reduceCollectionFormBeginSaveAction = (
  state: CollectionFormState,
): CollectionFormState => ({
  ...state,
  error: null,
  isSaving: true,
});

export const reduceCollectionFormFinishSaveAction = (
  state: CollectionFormState,
): CollectionFormState => ({
  ...state,
  isSaving: false,
});

export const reduceCollectionFormClearErrorAction = (
  state: CollectionFormState,
): CollectionFormState => ({
  ...state,
  error: null,
});
