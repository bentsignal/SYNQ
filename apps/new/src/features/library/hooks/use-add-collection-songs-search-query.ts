import { useReducer } from "react";
import {
  addCollectionSongsSearchReducer,
  initialAddCollectionSongsSearchState,
} from "../services/add-collection-songs-interaction-service";

export function useAddCollectionSongsSearchQuery() {
  const [state, dispatch] = useReducer(
    addCollectionSongsSearchReducer,
    initialAddCollectionSongsSearchState,
  );

  const setQuery = (query: string) => {
    dispatch({ query, type: "set-query" });
  };

  return {
    query: state.query,
    setQuery,
  };
}
