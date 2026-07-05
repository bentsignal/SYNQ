import { useCallback, useMemo, useReducer, useState } from "react";
import { useHapticFeedback } from "@/src/features/settings/hooks/use-haptic-feedback";
import {
  getLibraryCollectionListSetQueryAction,
  initialLibraryCollectionListControlState,
  libraryCollectionListControlReducer,
} from "../services/library-collection-list-control-state-service";
import { addLibraryCollectionSongCommand } from "../services/library-collection-command-service";
import {
  getSongAddToPlaylistFailureCommand,
  getSongAddToPlaylistControllerViewState,
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

  const viewState = useMemo(
    () =>
      getSongAddToPlaylistControllerViewState({
        collections,
        error,
        mutationState,
        query: controls.query,
        songId,
        updatedAt,
      }),
    [collections, controls.query, error, mutationState, songId, updatedAt],
  );

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
    ...viewState,
    query: controls.query,
    setQuery,
  };
}
