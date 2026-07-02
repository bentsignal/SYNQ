import { useLibraryCollectionDetailMutations } from "./use-library-collection-detail-mutations";
import { useLibraryCollectionPlaybackActions } from "./use-library-collection-playback-actions";
import type {
  LibraryCollectionDetail,
  LibraryCollectionDetailKind,
} from "../services/library-collection-detail-service";

type UseLibraryCollectionDetailControllerParams = {
  detail: LibraryCollectionDetail;
  id: number;
  kind: LibraryCollectionDetailKind;
};

export function useLibraryCollectionDetailController({
  detail,
  id,
  kind,
}: UseLibraryCollectionDetailControllerParams) {
  const mutations = useLibraryCollectionDetailMutations({
    detail,
    id,
    kind,
  });
  const playbackActions = useLibraryCollectionPlaybackActions({
    actionState: mutations.actionState,
  });

  return {
    ...mutations,
    ...playbackActions,
  };
}
