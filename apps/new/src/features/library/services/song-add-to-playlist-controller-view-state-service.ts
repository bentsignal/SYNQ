import type { LibraryCollectionPreview } from "./library-collection-preview-service";
import {
  getLibraryCollectionListErrors,
  getLibraryCollectionListState,
} from "./library-collection-list-service";
import {
  getSongAddToPlaylistCopy,
  getSongAddToPlaylistHeaderState,
} from "./song-add-to-playlist-header-state-service";
import {
  getSongAddToPlaylistStatusLabel,
  type SongAddToPlaylistMutationState,
} from "./song-add-to-playlist-mutation-state-service";
import {
  getSelectableSongPlaylists,
  getSongAddToPlaylistRowState,
} from "./song-add-to-playlist-row-state-service";
import { getSongAddToPlaylistStatusState } from "./song-add-to-playlist-status-state-service";

export const getSongAddToPlaylistControllerViewState = ({
  collections,
  error,
  mutationState,
  query,
  songId,
  updatedAt,
}: {
  collections: LibraryCollectionPreview[];
  error: unknown;
  mutationState: SongAddToPlaylistMutationState;
  query: string;
  songId: number;
  updatedAt: number;
}) => {
  const playlists = getSelectableSongPlaylists(collections);
  const listState = getLibraryCollectionListState({
    collections: playlists,
    emptyLabel: getSongAddToPlaylistCopy().emptyLabel,
    errors: getLibraryCollectionListErrors(error),
    query,
    updatedAt,
  });
  const statusLabel = getSongAddToPlaylistStatusLabel({
    mutationState,
    playlistCount: playlists.length,
    updatedAt,
  });

  return {
    copy: getSongAddToPlaylistCopy(),
    headerState: getSongAddToPlaylistHeaderState({ songId }),
    listState,
    rowStates: listState.visibleCollections.map((playlist) =>
      getSongAddToPlaylistRowState({
        mutationState,
        playlist,
      }),
    ),
    statusState: getSongAddToPlaylistStatusState({
      hasListErrors: listState.hasErrors,
      listStatusLabel: listState.statusLabel,
      mutationState,
      statusLabel,
    }),
  };
};

export type SongAddToPlaylistControllerViewState = ReturnType<
  typeof getSongAddToPlaylistControllerViewState
>;
