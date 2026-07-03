import { useHapticFeedback } from "@/src/features/settings/hooks/use-haptic-feedback";
import type {
  LibrarySongPreviewOrder,
  LibrarySongPreviewSort,
} from "../services/library-song-preview-service";
import { getLibrarySongListControlsState } from "../services/library-song-preview-state-service";

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
    const option = controlsState.sortOptions.find(
      (sortOption) => sortOption.value === nextSort,
    );
    if (option) {
      sendHaptic(option.haptic);
    }
    setSort(nextSort);
  };

  const toggleOrder = () => {
    sendHaptic(controlsState.orderButton.haptic);
    setOrder(controlsState.orderButton.nextOrder);
  };

  return {
    controlsState,
    selectSort,
    toggleOrder,
  };
}
