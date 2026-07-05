import type { LibraryCollectionPreview } from "./library-collection-preview-service";
import {
  getLibraryCollectionListErrors,
  getLibraryCollectionListState,
} from "./library-collection-list-service";
import { isProtectedPlaylistId } from "./library-playlist-constants-service";
import {
  getSongAddToPlaylistCopy,
  getSongAddToPlaylistHeaderState,
} from "./song-add-to-playlist-header-state-service";
import {
  getSongAddToPlaylistStatusLabel,
  type SongAddToPlaylistMutationState,
} from "./song-add-to-playlist-mutation-state-service";
import { getSongAddToPlaylistStatusState } from "./song-add-to-playlist-status-state-service";

export {
  getSongAddToPlaylistErrorMessage,
  getSongAddToPlaylistFailureCommand,
  getSongAddToPlaylistStatusLabel,
  getSongAddToPlaylistSuccessCommand,
  initialSongAddToPlaylistMutationState,
  type SongAddToPlaylistMutationState,
} from "./song-add-to-playlist-mutation-state-service";
export {
  getSongAddToPlaylistStatusState,
  type SongAddToPlaylistStatusState,
} from "./song-add-to-playlist-status-state-service";
export {
  getSongAddToPlaylistBackLink,
  getSongAddToPlaylistCopy,
  getSongAddToPlaylistHeaderState,
} from "./song-add-to-playlist-header-state-service";

export const getSelectableSongPlaylists = (
  playlists: LibraryCollectionPreview[],
) => playlists.filter((playlist) => !isProtectedPlaylistId(playlist.id));

export const getSongAddToPlaylistRowState = ({
  mutationState,
  playlist,
}: {
  mutationState: SongAddToPlaylistMutationState;
  playlist: LibraryCollectionPreview;
}) => {
  const isPending = mutationState.pendingPlaylistId === playlist.id;
  const isAdded = mutationState.successPlaylistId === playlist.id;

  return {
    detailLabel: isPending ? "Adding" : playlist.detail,
    imageInitial: playlist.title.slice(0, 1).toUpperCase(),
    isAdded,
    isDisabled: isPending,
    isPending,
    metaLabel: isAdded ? "Added" : playlist.meta,
    playlist,
  };
};

export type SongAddToPlaylistRowState = ReturnType<
  typeof getSongAddToPlaylistRowState
>;

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
