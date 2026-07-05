import type { LibraryCollectionDetailKind } from "./library-collection-kind-service";
import {
  runAddCollectionSongCommand,
  runAddCollectionSongsSelectionCommand,
  runAddCollectionSongsToggleSelectionCommand,
} from "./add-collection-songs-command-flow-service";
import type {
  AddCollectionSongsControllerDispatch,
  AddCollectionSongsHapticSender,
} from "./add-collection-songs-mutation-runtime-service";
import type { AddableSongSelectionState } from "./add-collection-songs-selection-service";

type AddCollectionSongsCollectionSongAdder = (params: {
  collectionId: number;
  kind: LibraryCollectionDetailKind;
  songId: number;
}) => Promise<void>;

type AddCollectionSongsCollectionSongsAdder = (params: {
  collectionId: number;
  kind: LibraryCollectionDetailKind;
  songIds: number[];
}) => Promise<void>;

type CreateAddCollectionSongsCommandsParams = {
  addCollectionSong: AddCollectionSongsCollectionSongAdder;
  addCollectionSongs: AddCollectionSongsCollectionSongsAdder;
  collectionId: number;
  dispatchControllerState: AddCollectionSongsControllerDispatch;
  kind: LibraryCollectionDetailKind;
  selectionState: AddableSongSelectionState;
  sendHaptic: AddCollectionSongsHapticSender;
};

export type AddCollectionSongsCommands = {
  addSelectedSongs: () => Promise<void>;
  addSong: (songId: number) => Promise<void>;
  toggleSongSelection: (songId: number) => void;
};

export const createAddCollectionSongsCommands = ({
  addCollectionSong,
  addCollectionSongs,
  collectionId,
  dispatchControllerState,
  kind,
  selectionState,
  sendHaptic,
}: CreateAddCollectionSongsCommandsParams): AddCollectionSongsCommands => ({
  addSelectedSongs: async () => {
    await runAddCollectionSongsSelectionCommand({
      addCollectionSongs,
      collectionId,
      dispatchControllerState,
      kind,
      selectionState,
      sendHaptic,
    });
  },
  addSong: async (songId) => {
    await runAddCollectionSongCommand({
      addCollectionSong,
      collectionId,
      dispatchControllerState,
      kind,
      sendHaptic,
      songId,
    });
  },
  toggleSongSelection: (songId) => {
    runAddCollectionSongsToggleSelectionCommand({
      dispatchControllerState,
      sendHaptic,
      songId,
    });
  },
});
