import type { MenuAction } from "@react-native-menu/menu";

import { Colors } from "@/src/constants/Colors";
import { SortOrder, SortType, type ShowSortTypes } from "@/src/constants/Types";

export type SortSelection = {
  sort: SortType;
  order: SortOrder;
};

type SortMenuDefinition = {
  id: string;
  sort: SortType;
  title: string;
  ascendingSubtitle: string;
  descendingSubtitle: string;
};

const SORT_MENU_DEFINITIONS: SortMenuDefinition[] = [
  {
    id: "date",
    sort: SortType.DATE,
    title: "Date Added",
    ascendingSubtitle: "Oldest → Newest",
    descendingSubtitle: "Newest → Oldest",
  },
  {
    id: "title",
    sort: SortType.TITLE,
    title: "Title",
    ascendingSubtitle: "A-Z",
    descendingSubtitle: "Z-A",
  },
  {
    id: "artist",
    sort: SortType.ARTIST,
    title: "Artist",
    ascendingSubtitle: "A-Z",
    descendingSubtitle: "Z-A",
  },
  {
    id: "album",
    sort: SortType.ALBUM,
    title: "Album",
    ascendingSubtitle: "A-Z",
    descendingSubtitle: "Z-A",
  },
  {
    id: "track",
    sort: SortType.TRACK,
    title: "Track",
    ascendingSubtitle: "1 → 999",
    descendingSubtitle: "999 → 1",
  },
  {
    id: "year",
    sort: SortType.YEAR,
    title: "Year",
    ascendingSubtitle: "2001 → 2025",
    descendingSubtitle: "2025 → 2001",
  },
];

export function parseSortMenuAction(event: string): SortSelection | undefined {
  const [menuId, orderId] = event.split("-");
  const definition = SORT_MENU_DEFINITIONS.find(({ id }) => id === menuId);

  if (!definition) {
    return undefined;
  }

  if (orderId === "asc") {
    return {
      sort: definition.sort,
      order: SortOrder.ASC,
    };
  }

  if (orderId === "desc") {
    return {
      sort: definition.sort,
      order: SortOrder.DESC,
    };
  }

  return undefined;
}

export function buildSortMenuActions(
  selection: SortSelection,
  showSortTypes?: ShowSortTypes,
): MenuAction[] {
  return SORT_MENU_DEFINITIONS.filter(({ sort }) => showSortTypes?.[sort]).map(
    (definition) => ({
      id: definition.id,
      title: definition.title,
      titleColor: Colors.text,
      subactions: [
        {
          id: `${definition.id}-asc`,
          title: "Ascending",
          subtitle: definition.ascendingSubtitle,
          titleColor: Colors.text,
          state:
            selection.sort === definition.sort && selection.order === SortOrder.ASC
              ? "on"
              : "off",
        },
        {
          id: `${definition.id}-desc`,
          title: "Descending",
          subtitle: definition.descendingSubtitle,
          titleColor: Colors.text,
          state:
            selection.sort === definition.sort && selection.order === SortOrder.DESC
              ? "on"
              : "off",
        },
      ],
    }),
  );
}
