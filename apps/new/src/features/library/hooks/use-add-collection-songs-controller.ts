import { useReducer } from "react";
import type { AddableCollectionSong } from "../services/addable-collection-songs-service";
import type { LibraryCollectionDetailKind } from "../services/library-collection-kind-service";
import { useAddCollectionSongsCommands } from "./use-add-collection-songs-commands";
import {
  addCollectionSongsControllerReducer,
  initialAddCollectionSongsControllerState,
} from "../services/add-collection-songs-state-service";
import { getAddCollectionSongsControllerResultState } from "../services/add-collection-songs-selection-service";

export function useAddCollectionSongsController({
  collectionId,
  kind,
  songs,
}: {
  collectionId: number;
  kind: LibraryCollectionDetailKind;
  songs: AddableCollectionSong[];
}) {
  const [controllerState, dispatchControllerState] = useReducer(
    addCollectionSongsControllerReducer,
    initialAddCollectionSongsControllerState,
  );
  const resultState = getAddCollectionSongsControllerResultState({
    controllerState,
    songs,
  });

  const { addSelectedSongs, addSong, toggleSongSelection } =
    useAddCollectionSongsCommands({
      collectionId,
      dispatchControllerState,
      kind,
      selectionState: resultState.selectionState,
    });

  return {
    addSelectedSongs,
    addSong,
    ...resultState,
    toggleSongSelection,
  };
}
