import { useLibrarySongDetailMutations } from "./use-library-song-detail-mutations";
import { useLibrarySongPlaybackActions } from "./use-library-song-playback-actions";
import type { LibrarySongDetail } from "../services/library-song-detail-service";

export function useLibrarySongDetailController({
  detail,
  songId,
}: {
  detail: LibrarySongDetail;
  songId: number;
}) {
  const mutations = useLibrarySongDetailMutations({
    detail,
    songId,
  });
  const playbackActions = useLibrarySongPlaybackActions({
    actionState: mutations.actionState,
    detail,
    songId,
  });

  return {
    ...mutations,
    ...playbackActions,
  };
}

export type LibrarySongDetailController = ReturnType<
  typeof useLibrarySongDetailController
>;
