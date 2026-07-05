import { useLibraryCollectionDetailController } from "./use-library-collection-detail-controller";
import type { LibraryCollectionDetail } from "../services/library-collection-detail-service";
import type { LibraryCollectionDetailKind } from "../services/library-collection-kind-service";
import { getCollectionDetailScreenViewState } from "../services/library-collection-interaction-service";

export type LibraryCollectionDetailQueryResult = {
  detail: LibraryCollectionDetail;
  errors: unknown[];
};

export function useLibraryCollectionDetailScreenController({
  collection,
  id,
  kind,
}: {
  collection: LibraryCollectionDetailQueryResult;
  id: number;
  kind: LibraryCollectionDetailKind;
}) {
  const { detail, errors } = collection;
  const controller = useLibraryCollectionDetailController({
    detail,
    id,
    kind,
  });
  const screenViewState = getCollectionDetailScreenViewState({
    actionState: controller.actionState,
    detail,
    errors,
    id,
    kind,
    movingSongId: controller.movingSongId,
    mutationError: controller.mutationError,
    removingSongId: controller.removingSongId,
  });

  return {
    collection,
    controller,
    screenViewState,
  };
}

export type LibraryCollectionDetailScreenController = ReturnType<
  typeof useLibraryCollectionDetailScreenController
>;
