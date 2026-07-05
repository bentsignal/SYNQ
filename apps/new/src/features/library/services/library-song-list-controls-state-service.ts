import type { HapticFeedbackType } from "../../settings/services/haptic-feedback-service";
import type {
  LibrarySongPreviewOrder,
  LibrarySongPreviewSort,
} from "./library-song-preview-service";

export const getLibrarySongListControlsState = ({
  order,
  sort,
}: {
  order: LibrarySongPreviewOrder;
  sort: LibrarySongPreviewSort;
}) => ({
  orderButton: {
    haptic: "light" as HapticFeedbackType,
    label: order === "asc" ? "Asc" : "Desc",
    nextOrder: order === "asc" ? "desc" as const : "asc" as const,
  },
  searchInput: {
    placeholder: "Search songs, artists, albums",
  },
  sortOptions: [
    {
      haptic: "light" as HapticFeedbackType,
      isActive: sort === "recent",
      label: "Recent",
      value: "recent" as const,
    },
    {
      haptic: "light" as HapticFeedbackType,
      isActive: sort === "title",
      label: "Title",
      value: "title" as const,
    },
    {
      haptic: "light" as HapticFeedbackType,
      isActive: sort === "artist",
      label: "Artist",
      value: "artist" as const,
    },
    {
      haptic: "light" as HapticFeedbackType,
      isActive: sort === "album",
      label: "Album",
      value: "album" as const,
    },
  ],
});
