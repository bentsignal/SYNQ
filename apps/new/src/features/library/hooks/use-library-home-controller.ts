import { useReducer } from "react";
import { useLibraryCollectionPreviewQuery } from "./use-library-collection-preview-query";
import { useLibrarySongPreviewQuery } from "./use-library-song-preview-query";
import { useLibrarySummaryQuery } from "./use-library-summary-query";
import {
  getLibraryHomeSetOrderAction,
  getLibraryHomeSetQueryAction,
  getLibraryHomeSetSortAction,
  initialLibraryHomeControlState,
  libraryHomeControlReducer,
} from "../services/library-home-control-service";
import {
  getLibraryHomeQueryErrors,
  getLibraryHomeStatusState,
} from "../services/library-home-status-service";
import type {
  LibrarySongPreviewOrder,
  LibrarySongPreviewSort,
} from "../services/library-song-preview-service";

export function useLibraryHomeController() {
  const [controls, dispatchControls] = useReducer(
    libraryHomeControlReducer,
    initialLibraryHomeControlState,
  );
  const summary = useLibrarySummaryQuery();
  const collectionPreview = useLibraryCollectionPreviewQuery();
  const songPreview = useLibrarySongPreviewQuery(controls);
  const statusState = getLibraryHomeStatusState({
    collectionUpdatedAt: collectionPreview.updatedAt,
    errors: getLibraryHomeQueryErrors({
      collectionErrors: collectionPreview.errors,
      songError: songPreview.error,
      summaryErrors: summary.errors,
    }),
    songUpdatedAt: songPreview.updatedAt,
    summaryUpdatedAt: summary.updatedAt,
  });

  const setQuery = (query: string) => {
    dispatchControls(getLibraryHomeSetQueryAction(query));
  };
  const setSort = (sort: LibrarySongPreviewSort) => {
    dispatchControls(getLibraryHomeSetSortAction(sort));
  };
  const setOrder = (order: LibrarySongPreviewOrder) => {
    dispatchControls(getLibraryHomeSetOrderAction(order));
  };

  return {
    collectionPreview,
    order: controls.order,
    query: controls.query,
    setOrder,
    setQuery,
    setSort,
    songPreview,
    sort: controls.sort,
    statusState,
    summary,
  };
}

export type LibraryHomeController = ReturnType<typeof useLibraryHomeController>;
