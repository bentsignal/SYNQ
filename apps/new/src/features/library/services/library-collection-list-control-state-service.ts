export type LibraryCollectionListControlState = {
  query: string;
};

export type LibraryCollectionListControlAction = {
  query: string;
  type: "set-query";
};

export const initialLibraryCollectionListControlState: LibraryCollectionListControlState =
  {
    query: "",
  };

export const getLibraryCollectionListSetQueryAction = (
  query: string,
): LibraryCollectionListControlAction => ({
  query,
  type: "set-query",
});

export const libraryCollectionListControlReducer = (
  state: LibraryCollectionListControlState,
  action: LibraryCollectionListControlAction,
): LibraryCollectionListControlState => {
  switch (action.type) {
    case "set-query":
      return {
        ...state,
        query: action.query,
      };
  }
};
