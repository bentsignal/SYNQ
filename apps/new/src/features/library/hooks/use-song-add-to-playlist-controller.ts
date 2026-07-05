import { useMemo, useReducer, useState } from "react";
import { useHapticFeedback } from "@/src/features/settings/hooks/use-haptic-feedback";
import {
  initialLibraryCollectionListControlState,
  libraryCollectionListControlReducer,
} from "../services/library-collection-list-control-state-service";
import { addLibraryCollectionSongCommand } from "../services/library-collection-command-service";
import {
  createSongAddToPlaylistControllerCommands,
  getSongAddToPlaylistController,
} from "../services/song-add-to-playlist-controller-service";
import {
  getSongAddToPlaylistControllerViewState,
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
  const commands = useMemo(
    () =>
      createSongAddToPlaylistControllerCommands({
        addLibraryCollectionSong: addLibraryCollectionSongCommand,
        dispatchControls,
        sendHaptic,
        setMutationState,
        songId,
      }),
    [sendHaptic, songId],
  );

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

  return getSongAddToPlaylistController({
    commands,
    query: controls.query,
    viewState,
  });
}
