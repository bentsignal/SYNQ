import { useReducer } from "react";
import { usePlaybackRemoveFromQueue } from "@/src/features/playback/hooks/use-playback-session-selectors";
import type { LibrarySongDetail } from "../services/library-song-detail-service";
import { getLibrarySongDetailMutationActionState } from "../services/library-song-detail-state-service";
import {
  initialLibrarySongDetailMutationState,
  librarySongDetailMutationReducer,
} from "../services/library-song-detail-mutation-service";
import { useLibrarySongDeleteMutation } from "./use-library-song-delete-mutation";
import { useLibrarySongExportMutation } from "./use-library-song-export-mutation";
import { useLibrarySongLikedMutation } from "./use-library-song-liked-mutation";

type UseLibrarySongDetailMutationsParams = {
  detail: LibrarySongDetail;
  songId: number;
};

export function useLibrarySongDetailMutations({
  detail,
  songId,
}: UseLibrarySongDetailMutationsParams) {
  const removeFromQueue = usePlaybackRemoveFromQueue();
  const [mutationState, dispatchMutation] = useReducer(
    librarySongDetailMutationReducer,
    initialLibrarySongDetailMutationState,
  );
  const actionState = getLibrarySongDetailMutationActionState({
    detail,
    mutationState,
  });

  const toggleLiked = useLibrarySongLikedMutation({
    actionState,
    detail,
    dispatchMutation,
    songId,
  });
  const exportCurrentSong = useLibrarySongExportMutation({
    actionState,
    detail,
    dispatchMutation,
    songId,
  });
  const deleteCurrentSong = useLibrarySongDeleteMutation({
    actionState,
    detail,
    dispatchMutation,
    removeFromQueue,
    songId,
  });

  return {
    actionState,
    deleteCurrentSong,
    error: mutationState.error,
    exportCurrentSong,
    toggleLiked,
  };
}
