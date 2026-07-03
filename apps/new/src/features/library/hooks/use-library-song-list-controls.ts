import { useHapticFeedback } from "@/src/features/settings/hooks/use-haptic-feedback";
import type {
  LibrarySongPreviewOrder,
  LibrarySongPreviewSort,
} from "../services/library-song-preview-service";
import { getLibrarySongListControlsState } from "../services/library-song-preview-state-service";
import {
  runLibrarySongListOrderToggleAction,
  runLibrarySongListSortSelectAction,
} from "../services/library-song-list-controls-action-flow-service";

type UseLibrarySongListControlsParams = {
  order: LibrarySongPreviewOrder;
  setOrder: (order: LibrarySongPreviewOrder) => void;
  setSort: (sort: LibrarySongPreviewSort) => void;
  sort: LibrarySongPreviewSort;
};

export function useLibrarySongListControls({
  order,
  setOrder,
  setSort,
  sort,
}: UseLibrarySongListControlsParams) {
  const { sendHaptic } = useHapticFeedback();
  const controlsState = getLibrarySongListControlsState({ order, sort });

  const selectSort = (nextSort: LibrarySongPreviewSort) => {
    runLibrarySongListSortSelectAction({
      order,
      sendHaptic,
      setSort,
      sort: nextSort,
    });
  };

  const toggleOrder = () => {
    runLibrarySongListOrderToggleAction({
      order,
      sendHaptic,
      setOrder,
      sort,
    });
  };

  return {
    controlsState,
    selectSort,
    toggleOrder,
  };
}
