import type { HapticFeedbackType } from "../../settings/services/haptic-feedback-service";
import type {
  LibrarySongPreviewOrder,
  LibrarySongPreviewSort,
} from "./library-song-preview-service";
import { getLibrarySongListControlsState } from "./library-song-list-controls-state-service";

type HapticSender = (type: HapticFeedbackType) => void;

export const runLibrarySongListSortSelectAction = ({
  order,
  sendHaptic,
  setSort,
  sort,
}: {
  order: LibrarySongPreviewOrder;
  sendHaptic: HapticSender;
  setSort: (sort: LibrarySongPreviewSort) => void;
  sort: LibrarySongPreviewSort;
}) => {
  const controlsState = getLibrarySongListControlsState({ order, sort });
  const option = controlsState.sortOptions.find(
    (sortOption) => sortOption.value === sort,
  );
  if (option) {
    sendHaptic(option.haptic);
  }
  setSort(sort);
};

export const runLibrarySongListOrderToggleAction = ({
  order,
  sendHaptic,
  setOrder,
  sort,
}: {
  order: LibrarySongPreviewOrder;
  sendHaptic: HapticSender;
  setOrder: (order: LibrarySongPreviewOrder) => void;
  sort: LibrarySongPreviewSort;
}) => {
  const controlsState = getLibrarySongListControlsState({ order, sort });
  sendHaptic(controlsState.orderButton.haptic);
  setOrder(controlsState.orderButton.nextOrder);
};
