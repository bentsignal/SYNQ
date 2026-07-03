import { useReducer } from "react";
import {
  addCollectionSongsSearchReducer,
  getAddCollectionSongsSearchSetQueryAction,
  initialAddCollectionSongsSearchState,
} from "../services/add-collection-songs-search-state-service";

export function useAddCollectionSongsSearchQuery() {
  const [state, dispatch] = useReducer(
    addCollectionSongsSearchReducer,
    initialAddCollectionSongsSearchState,
  );

  const setQuery = (query: string) => {
    dispatch(getAddCollectionSongsSearchSetQueryAction(query));
  };

  return {
    query: state.query,
    setQuery,
  };
}
