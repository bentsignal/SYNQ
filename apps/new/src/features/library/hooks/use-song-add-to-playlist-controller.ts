import { useCallback, useMemo, useReducer, useState } from "react";
import { useHapticFeedback } from "@/src/features/settings/hooks/use-haptic-feedback";
import {
  getLibraryCollectionListSetQueryAction,
  initialLibraryCollectionListControlState,
  libraryCollectionListControlReducer,
} from "../services/library-collection-list-control-state-service";
import {
  getLibraryCollectionListErrors,
  getLibraryCollectionListState,
} from "../services/library-collection-list-service";
import { addLibraryCollectionSongCommand } from "../services/library-collection-command-service";
import {
  getSelectableSongPlaylists,
  getSongAddToPlaylistFailureCommand,
  getSongAddToPlaylistStatusLabel,
  getSongAddToPlaylistSuccessCommand,
  initialSongAddToPlaylistMutationState,
  type SongAddToPlaylistMutationState,
} from "../services/song-add-to-playlist-service";
import { useLibraryCollectionListQuery } from "./use-library-collection-list-query";

export function useSongAddToPlaylistController({ songId }: { songId: number }) {
  const { sendHaptic } = useHapticFeedback();
  const [controls, dispatchControls] = useReducer(
    libraryCollectionListControlReducer,
    initialLibraryCollectionListControlState,
  );
  const [mutationState, setMutationState] =
    useState<SongAddToPlaylistMutationState>(
      initialSongAddToPlaylistMutationState,
    );
  const { collections, error, updatedAt } = useLibraryCollectionListQuery({
    kind: "playlists",
    limit: null,
  });

  const playlists = useMemo(
    () => getSelectableSongPlaylists(collections),
    [collections],
  );
  const listState = getLibraryCollectionListState({
    collections: playlists,
    emptyLabel: "No playlists available",
    errors: getLibraryCollectionListErrors(error),
    query: controls.query,
    updatedAt,
  });
  const statusLabel = getSongAddToPlaylistStatusLabel({
    mutationState,
    playlistCount: playlists.length,
    updatedAt,
  });

  const setQuery = (query: string) => {
    dispatchControls(getLibraryCollectionListSetQueryAction(query));
  };

  const addToPlaylist = useCallback(
    async (playlistId: number) => {
      setMutationState({
        error: null,
        pendingPlaylistId: playlistId,
        successPlaylistId: null,
      });

      try {
        await addLibraryCollectionSongCommand({
          collectionId: playlistId,
          kind: "playlist",
          songId,
        });
        sendHaptic(getSongAddToPlaylistSuccessCommand().haptic);
        setMutationState({
          error: null,
          pendingPlaylistId: null,
          successPlaylistId: playlistId,
        });
      } catch (caughtError) {
        sendHaptic(getSongAddToPlaylistFailureCommand().haptic);
        setMutationState({
          error: caughtError,
          pendingPlaylistId: null,
          successPlaylistId: null,
        });
      }
    },
    [sendHaptic, songId],
  );

  return {
    addToPlaylist,
    listState,
    mutationState,
    query: controls.query,
    setQuery,
    statusLabel,
  };
}
