import type { HapticFeedbackType } from "../../settings/services/haptic-feedback-service";
import {
  getCollectionDetailHref,
  type CollectionDetailHref,
} from "./collection-form-navigation-service";
import { getCollectionRequiredNameMessage } from "./collection-metadata-service";

export type CollectionFormKind = "album" | "artist" | "playlist";

export type CollectionFormImage = {
  dataUrl: string;
  fileName: string;
};

export type CollectionFormState = {
  artistNames: string;
  error: string | null;
  image: CollectionFormImage | null;
  isDirty: boolean;
  isSaving: boolean;
  name: string;
  year: string;
};

export type CollectionFormAction =
  | {
      artistNames: string;
      name: string;
      type: "hydrate";
      year: string;
    }
  | {
      field: "artistNames" | "name" | "year";
      type: "change-field";
      value: string;
    }
  | {
      image: CollectionFormImage;
      type: "pick-image";
    }
  | {
      error: string;
      type: "fail";
    }
  | {
      type: "begin-save";
    }
  | {
      type: "finish-save";
    }
  | {
      type: "clear-error";
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

export const parseAlbumYearInput = (value: string) => {
  const trimmed = value.trim();

  if (!trimmed) {
    return undefined;
  }

  const year = Number(trimmed);

  if (!Number.isInteger(year) || year < 0) {
    throw new Error("Album year must be a positive whole number.");
  }

  return year;
};

export const getCollectionFormErrorMessage = ({
  caughtError,
  fallbackMessage,
}: {
  caughtError: unknown;
  fallbackMessage: string;
}) => (caughtError instanceof Error ? caughtError.message : fallbackMessage);

type CollectionFormOperation = "create" | "update";

type CollectionFormHapticCommand = {
  haptic: HapticFeedbackType;
};

type CollectionFormActionCommand = CollectionFormHapticCommand & {
  action: CollectionFormAction;
};

type CollectionFormSuccessCommand = CollectionFormHapticCommand & {
  href: CollectionDetailHref;
};

const getCollectionFormFallbackMessage = ({
  kind,
  operation,
}: {
  kind: CollectionFormKind;
  operation: CollectionFormOperation;
}) => {
  const noun = `${kind[0]?.toUpperCase() ?? ""}${kind.slice(1)}`;
  const verb = operation === "create" ? "created" : "updated";

  return `${noun} could not be ${verb}.`;
};

export const getCollectionFormBlockedSaveCommand = (
  kind: CollectionFormKind,
): CollectionFormActionCommand => ({
  action: {
    error: getCollectionRequiredNameMessage(kind),
    type: "fail",
  },
  haptic: "error",
});

export const getCollectionFormBeginSaveCommand =
  (): Pick<CollectionFormActionCommand, "action"> => ({
    action: {
      type: "begin-save",
    },
  });

export const getCollectionFormSuccessCommand = ({
  id,
  kind,
}: {
  id: number;
  kind: CollectionFormKind;
}): CollectionFormSuccessCommand => ({
  haptic: "success",
  href: getCollectionDetailHref({ id, kind }),
});

export const getCollectionFormFailureCommand = ({
  caughtError,
  kind,
  operation,
}: {
  caughtError: unknown;
  kind: CollectionFormKind;
  operation: CollectionFormOperation;
}): CollectionFormActionCommand => ({
  action: {
    error: getCollectionFormErrorMessage({
      caughtError,
      fallbackMessage: getCollectionFormFallbackMessage({ kind, operation }),
    }),
    type: "fail",
  },
  haptic: "error",
});
