import type { LibraryCollectionPreview } from "./library-collection-preview-service";
import { isProtectedPlaylistId } from "./library-playlist-constants-service";
import type { SongAddToPlaylistMutationState } from "./song-add-to-playlist-mutation-state-service";

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
