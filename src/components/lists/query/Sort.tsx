import { Text, TouchableOpacity, StyleSheet } from "react-native";

import { MenuView, NativeActionEvent, MenuAction } from '@react-native-menu/menu'

import { Styles } from "@/src/constants/Styles";
import { Colors } from "@/src/constants/Colors";
import { SortType, SortOrder, PageType } from "@/src/constants/Types";

type SortProps = {
  setSort: (sort: SortType) => void;
  sort: SortType;
  order: SortOrder;
  setOrder: (order: SortOrder) => void;
  pageType?: PageType;
}

export default function Sort({ setSort, sort, order, setOrder, pageType }: SortProps) {
  
  const handleChange = (nativeEvent: NativeActionEvent) => {
    const event = nativeEvent.nativeEvent.event;
    if (event === 'date-asc') {
      setSort(SortType.DATE);
      setOrder(SortOrder.ASC);
    } else if (event === 'date-desc') {
      setSort(SortType.DATE);
      setOrder(SortOrder.DESC);
    } else if (event === 'title-asc') {
      setSort(SortType.TITLE);
      setOrder(SortOrder.ASC);
    } else if (event === 'title-desc') {
      setSort(SortType.TITLE);
      setOrder(SortOrder.DESC);
    } else if (event === 'artist-asc') {
      setSort(SortType.ARTIST);
      setOrder(SortOrder.ASC);
    } else if (event === 'artist-desc') {
      setSort(SortType.ARTIST);
      setOrder(SortOrder.DESC);
    } else if (event === 'album-asc') {
      setSort(SortType.ALBUM);
      setOrder(SortOrder.ASC);
    } else if (event === 'album-desc') {
      setSort(SortType.ALBUM);
      setOrder(SortOrder.DESC);
    } else if (event === 'track-asc') {
      setSort(SortType.TRACK);
      setOrder(SortOrder.ASC);
    } else if (event === 'track-desc') {
      setSort(SortType.TRACK);
      setOrder(SortOrder.DESC);
    }
  }

  const actions: MenuAction[] = [];
  if ([PageType.PLAYLIST].includes(pageType)) {
    actions.push({
      id: 'date',
      title: 'Date Added',
      titleColor: Colors.text,
      subactions: [
        {
          id: 'date-asc',
          title: 'Ascending',
          subtitle: 'Oldest → Newest',
          titleColor: Colors.text,
          state: sort === SortType.DATE && order === SortOrder.ASC ? 'on' : 'off',
        },
        {
          id: 'date-desc',
          title: 'Descending',
          subtitle: 'Newest → Oldest',
          titleColor: Colors.text,
          state: sort === SortType.DATE && order === SortOrder.DESC ? 'on' : 'off',
        }
      ],
    });
  }
  if ([PageType.PLAYLIST].includes(pageType)) {
    actions.push({
      id: 'title',
      title: 'Title',
      titleColor: Colors.text,
      subactions: [
        {
          id: 'title-asc',
          title: 'Ascending',
          subtitle: 'A-Z',
          titleColor: Colors.text,
          state: sort === SortType.TITLE && order === SortOrder.ASC ? 'on' : 'off',
        },
        {
          id: 'title-desc',
          title: 'Descending',
          subtitle: 'Z-A',
          titleColor: Colors.text,
          state: sort === SortType.TITLE && order === SortOrder.DESC ? 'on' : 'off',
        }
      ],
    });
  }
  if ([PageType.PLAYLIST].includes(pageType)) {
    actions.push({
      id: 'artist',
      title: 'Artist',
      titleColor: Colors.text,
      subactions: [
        {
          id: 'artist-asc',
          title: 'Ascending',
          subtitle: 'A-Z',
          titleColor: Colors.text,
          state: sort === SortType.ARTIST && order === SortOrder.ASC ? 'on' : 'off',
        },
        {
          id: 'artist-desc',
          title: 'Descending',
          subtitle: 'Z-A',
          titleColor: Colors.text,
          state: sort === SortType.ARTIST && order === SortOrder.DESC ? 'on' : 'off',
        }
      ],
    });
  }
  if ([PageType.PLAYLIST].includes(pageType)) {
    actions.push({
      id: 'album',
      title: 'Album',
      titleColor: Colors.text,
      subactions: [
        {
          id: 'album-asc',
          title: 'Ascending',
          subtitle: 'A-Z',
          titleColor: Colors.text,
          state: sort === SortType.ALBUM && order === SortOrder.ASC ? 'on' : 'off',
        },
        {
          id: 'album-desc',
          title: 'Descending',
          subtitle: 'Z-A',
          titleColor: Colors.text,
          state: sort === SortType.ALBUM && order === SortOrder.DESC ? 'on' : 'off',
        }
      ],
    });
  }

  if ([PageType.ALBUM].includes(pageType)) {
    actions.push({
      id: 'track',
      title: 'Track',
      titleColor: Colors.text,
      subactions: [
        {
          id: 'track-asc',
          title: 'Ascending',
          subtitle: '1 → 999',
          titleColor: Colors.text,
          state: sort === SortType.TRACK && order === SortOrder.ASC ? 'on' : 'off',
        },
        {
          id: 'track-desc',
          title: 'Descending',
          subtitle: '999 → 1',
          titleColor: Colors.text,
          state: sort === SortType.TRACK && order === SortOrder.DESC ? 'on' : 'off',
        }
      ],
    },);
  }

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
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    ...Styles.h6,
    color: Colors.text,
  },
});
