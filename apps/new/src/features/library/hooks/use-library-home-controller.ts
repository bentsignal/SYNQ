import { useReducer } from "react";
import { useLibraryCollectionPreviewQuery } from "./use-library-collection-preview-query";
import { useLibrarySongPreviewQuery } from "./use-library-song-preview-query";
import { useLibrarySummaryQuery } from "./use-library-summary-query";
import {
  getLibraryHomeStatusState,
  initialLibraryHomeControlState,
  libraryHomeControlReducer,
} from "../services/library-home-service";
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
    errors: [
      ...summary.errors,
      ...collectionPreview.errors,
      ...(songPreview.error ? [songPreview.error] : []),
    ],
    songUpdatedAt: songPreview.updatedAt,
    summaryUpdatedAt: summary.updatedAt,
  });

  const setQuery = (query: string) => {
    dispatchControls({ query, type: "set-query" });
  };
  const setSort = (sort: LibrarySongPreviewSort) => {
    dispatchControls({ sort, type: "set-sort" });
  };
  const setOrder = (order: LibrarySongPreviewOrder) => {
    dispatchControls({ order, type: "set-order" });
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
