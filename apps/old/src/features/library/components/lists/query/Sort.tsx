import { Text, StyleSheet } from "react-native";

import { MenuView, NativeActionEvent } from "@react-native-menu/menu";

import { Styles } from "@/src/constants/Styles";
import { Colors } from "@/src/constants/Colors";
import { SortType, SortOrder, ShowSortTypes } from "@/src/constants/Types";
import {
  buildSortMenuActions,
  parseSortMenuAction,
} from "@/src/features/library/lib/sort-menu";

type SortProps = {
  setSort: (sort: SortType) => void;
  sort: SortType;
  order: SortOrder;
  setOrder: (order: SortOrder) => void;
  showSortTypes?: ShowSortTypes;
};

export default function Sort({ setSort, sort, order, setOrder, showSortTypes }: SortProps) {
  const handleChange = (nativeEvent: NativeActionEvent) => {
    const selection = parseSortMenuAction(nativeEvent.nativeEvent.event);

    if (selection) {
      setSort(selection.sort);
      setOrder(selection.order);
    }
  };

  const actions = buildSortMenuActions({ sort, order }, showSortTypes);

  return (
    <MenuView
      title="Sort By"
      style={Local.container}
      onPressAction={handleChange}
      actions={actions}
      shouldOpenOnLongPress={false}
    >
      <Text style={Local.text}>Sort</Text>
    </MenuView>
  );
}

const Local = StyleSheet.create({
  container: {
    ...Styles.roundedContainer,
    backgroundColor: Colors.song,
    paddingVertical: 10,
    paddingHorizontal: 15,
    alignItems: "center",
    justifyContent: "center",
  },
  text: {
    ...Styles.h6,
    color: Colors.text,
  },
});
