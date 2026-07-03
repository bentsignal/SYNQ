import type {
  LibrarySongPreviewOrder,
  LibrarySongPreviewSort,
} from "./library-song-preview-service";

export type LibraryHomeControlState = {
  order: LibrarySongPreviewOrder;
  query: string;
  sort: LibrarySongPreviewSort;
};

export type LibraryHomeControlAction =
  | {
      query: string;
      type: "set-query";
    }
  | {
      sort: LibrarySongPreviewSort;
      type: "set-sort";
    }
  | {
      order: LibrarySongPreviewOrder;
      type: "set-order";
    };

export const initialLibraryHomeControlState: LibraryHomeControlState = {
  order: "desc",
  query: "",
  sort: "recent",
};

export const getLibraryHomeSetQueryAction = (
  query: string,
): LibraryHomeControlAction => ({
  query,
  type: "set-query",
});

export const getLibraryHomeSetSortAction = (
  sort: LibrarySongPreviewSort,
): LibraryHomeControlAction => ({
  sort,
  type: "set-sort",
});

export const getLibraryHomeSetOrderAction = (
  order: LibrarySongPreviewOrder,
): LibraryHomeControlAction => ({
  order,
  type: "set-order",
});

export const libraryHomeControlReducer = (
  state: LibraryHomeControlState,
  action: LibraryHomeControlAction,
): LibraryHomeControlState => {
  switch (action.type) {
    case "set-query":
      return {
        ...state,
        query: action.query,
      };
    case "set-sort":
      return {
        ...state,
        sort: action.sort,
      };
    case "set-order":
      return {
        ...state,
        order: action.order,
      };
  }
};
