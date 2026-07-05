import type {
  CollectionFormAction,
  CollectionFormImage,
} from "./collection-form-action-service";

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
      if (state.isDirty) {
        return state;
      }

      return {
        ...state,
        artistNames: action.artistNames,
        name: action.name,
        year: action.year,
      };
    case "change-field":
      return {
        ...state,
        [action.field]: action.value,
        error: null,
        isDirty: true,
      };
    case "pick-image":
      return {
        ...state,
        error: null,
        image: action.image,
        isDirty: true,
      };
    case "fail":
      return {
        ...state,
        error: action.error,
      };
    case "begin-save":
      return {
        ...state,
        error: null,
        isSaving: true,
      };
    case "finish-save":
      return {
        ...state,
        isSaving: false,
      };
    case "clear-error":
      return {
        ...state,
        error: null,
      };
  }
};
