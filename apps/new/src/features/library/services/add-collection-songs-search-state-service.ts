export type AddCollectionSongsSearchState = {
  query: string;
};

export type AddCollectionSongsSearchAction = {
  query: string;
  type: "set-query";
};

export const initialAddCollectionSongsSearchState: AddCollectionSongsSearchState =
  {
    query: "",
  };

export const getAddCollectionSongsSearchSetQueryAction = (
  query: string,
): AddCollectionSongsSearchAction => ({
  query,
  type: "set-query",
});

export const addCollectionSongsSearchReducer = (
  state: AddCollectionSongsSearchState,
  action: AddCollectionSongsSearchAction,
): AddCollectionSongsSearchState => {
  switch (action.type) {
    case "set-query":
      return {
        ...state,
        query: action.query,
      };
  }
};
