import { useReducer } from "react";
import { usePlaybackSession } from "@/src/features/playback/hooks/use-playback-session";
import {
  getLibrarySongDetailActionState,
  initialLibrarySongDetailMutationState,
  librarySongDetailMutationReducer,
  type LibrarySongDetail,
} from "../services/library-song-detail-service";
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
  const { removeFromQueue } = usePlaybackSession();
  const [mutationState, dispatchMutation] = useReducer(
    librarySongDetailMutationReducer,
    initialLibrarySongDetailMutationState,
  );
  const actionState = getLibrarySongDetailActionState({
    detail,
    isDeleting: mutationState.isDeleting,
    isExporting: mutationState.isExporting,
    isTogglingLiked: mutationState.isTogglingLiked,
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
