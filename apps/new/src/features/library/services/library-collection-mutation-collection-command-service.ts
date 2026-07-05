import type { HapticFeedbackType } from "../../settings/services/haptic-feedback-service";
import type { LibraryCollectionDetailKind } from "./library-collection-kind-service";
import {
  getCollectionListHref,
  type LibraryCollectionListHref,
} from "./library-collection-navigation-service";
import type { CollectionDetailMutationAction } from "./library-collection-mutation-state-service";

type CollectionDetailMutationActionCommand = {
  action: CollectionDetailMutationAction;
};

type CollectionDetailMutationHapticCommand = {
  haptic: HapticFeedbackType;
};

type CollectionDetailMutationNavigationCommand =
  CollectionDetailMutationHapticCommand & {
    href: LibraryCollectionListHref;
  };

export const getCollectionDeleteStartCommand =
  (): CollectionDetailMutationActionCommand => ({
    action: {
      mutation: "delete-collection",
      type: "begin",
    },
  });

export const getCollectionDeleteSuccessCommand = ({
  kind,
}: {
  kind: LibraryCollectionDetailKind;
}): CollectionDetailMutationNavigationCommand => ({
  haptic: "success",
  href: getCollectionListHref(kind),
});

export const getCollectionDeleteFinishCommand =
  (): CollectionDetailMutationActionCommand => ({
    action: {
      mutation: "delete-collection",
      type: "finish",
    },
  });

export const getCollectionExportStartCommand =
  (): CollectionDetailMutationActionCommand => ({
    action: {
      mutation: "export-collection",
      type: "begin",
    },
  });

export const getCollectionExportSuccessCommand =
  (): CollectionDetailMutationHapticCommand => ({
    haptic: "success",
  });

export const getCollectionExportFinishCommand =
  (): CollectionDetailMutationActionCommand => ({
    action: {
      mutation: "export-collection",
      type: "finish",
    },
  });
