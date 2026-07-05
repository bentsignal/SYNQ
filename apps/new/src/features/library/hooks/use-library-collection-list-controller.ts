import { useMemo, useReducer } from "react";
import {
  type CollectionKind,
  useLibraryCollectionListQuery,
} from "./use-library-collection-list-query";
import {
  getLibraryCollectionListSetQueryAction,
  initialLibraryCollectionListControlState,
  libraryCollectionListControlReducer,
} from "../services/library-collection-list-control-state-service";
import {
  getLibraryCollectionListControllerViewState,
} from "../services/library-collection-list-service";

type UseLibraryCollectionListControllerParams = {
  kind: CollectionKind;
};

export function useLibraryCollectionListController({
  kind,
}: UseLibraryCollectionListControllerParams) {
  const [controls, dispatchControls] = useReducer(
    libraryCollectionListControlReducer,
    initialLibraryCollectionListControlState,
  );
  const { collections, error, updatedAt } = useLibraryCollectionListQuery({
    kind,
    limit: null,
  });
  const viewState = useMemo(
    () =>
      getLibraryCollectionListControllerViewState({
        collections,
        error,
        kind,
        query: controls.query,
        updatedAt,
      }),
    [collections, controls.query, error, kind, updatedAt],
  );

  const setQuery = (query: string) => {
    dispatchControls(getLibraryCollectionListSetQueryAction(query));
  };

  return {
    ...viewState,
    query: controls.query,
    setQuery,
  };
}
