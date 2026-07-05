import type { HapticFeedbackType } from "../../settings/services/haptic-feedback-service";
import {
  getCollectionDetailHref,
  type CollectionDetailHref,
} from "./collection-form-navigation-service";
import {
  getCollectionFormErrorMessage,
  getCollectionFormFallbackMessage,
} from "./collection-form-service";
import type { CollectionFormKind } from "./collection-form-domain-service";
import type { CollectionFormAction } from "./collection-form-action-service";
import { getCollectionRequiredNameMessage } from "./collection-metadata-service";

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
