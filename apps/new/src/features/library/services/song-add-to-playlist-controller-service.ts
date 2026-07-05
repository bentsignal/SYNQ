import type { HapticFeedbackType } from "../../settings/services/haptic-feedback-service";
import {
  getLibraryCollectionListSetQueryAction,
  type LibraryCollectionListControlAction,
} from "./library-collection-list-control-state-service";
import { runSongAddToPlaylistCommand } from "./song-add-to-playlist-command-flow-service";
import type {
  SongAddToPlaylistControllerViewState,
  SongAddToPlaylistMutationState,
} from "./song-add-to-playlist-service";

type SongAddToPlaylistMutationStateSetter = (
  state: SongAddToPlaylistMutationState,
) => void;

type LibraryPlaylistSongAdder = (params: {
  collectionId: number;
  kind: "playlist";
  songId: number;
}) => Promise<void>;

type SongAddToPlaylistControllerDependencies = {
  addLibraryCollectionSong: LibraryPlaylistSongAdder;
  dispatchControls: (action: LibraryCollectionListControlAction) => void;
  sendHaptic: (type: HapticFeedbackType) => void;
  setMutationState: SongAddToPlaylistMutationStateSetter;
  songId: number;
};

export type SongAddToPlaylistControllerCommands = {
  addToPlaylist: (playlistId: number) => Promise<void>;
  setQuery: (query: string) => void;
};

type GetSongAddToPlaylistControllerParams = {
  commands: SongAddToPlaylistControllerCommands;
  query: string;
  viewState: SongAddToPlaylistControllerViewState;
};

export const getSongAddToPlaylistController = ({
  commands,
  query,
  viewState,
}: GetSongAddToPlaylistControllerParams) => ({
  addToPlaylist: commands.addToPlaylist,
  ...viewState,
  query,
  setQuery: commands.setQuery,
});

export const createSongAddToPlaylistControllerCommands = ({
  addLibraryCollectionSong,
  dispatchControls,
  sendHaptic,
  setMutationState,
  songId,
}: SongAddToPlaylistControllerDependencies): SongAddToPlaylistControllerCommands => ({
  addToPlaylist: async (playlistId) => {
    await runSongAddToPlaylistCommand({
      addLibraryCollectionSong,
      playlistId,
      sendHaptic,
      setMutationState,
      songId,
    });
  },
  setQuery: (query) => {
    dispatchControls(getLibraryCollectionListSetQueryAction(query));
  },
});
