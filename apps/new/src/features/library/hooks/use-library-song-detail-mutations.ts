import { useReducer } from "react";
import { usePlaybackRemoveFromQueue } from "@/src/features/playback/hooks/use-playback-session-selectors";
import type { LibrarySongDetail } from "../services/library-song-detail-service";
import { getLibrarySongDetailMutationControllerState } from "../services/library-song-detail-mutation-controller-state-service";
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
  const controllerState = getLibrarySongDetailMutationControllerState({
    detail,
    mutationState,
  });

  const toggleLiked = useLibrarySongLikedMutation({
    actionState: controllerState.actionState,
    detail,
    dispatchMutation,
    songId,
  });
  const exportCurrentSong = useLibrarySongExportMutation({
    actionState: controllerState.actionState,
    detail,
    dispatchMutation,
    songId,
  });
  const deleteCurrentSong = useLibrarySongDeleteMutation({
    actionState: controllerState.actionState,
    detail,
    dispatchMutation,
    removeFromQueue,
    songId,
  });

  return {
    ...controllerState,
    deleteCurrentSong,
    exportCurrentSong,
    toggleLiked,
  };
}
