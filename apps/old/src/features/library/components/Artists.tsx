import { StyleSheet, Text, View } from "react-native";
import { Colors } from "@/src/constants/Colors";
import { PageType, SortOrder, SortType } from "@/src/constants/Types";
import ArtistList from "@/src/features/library/components/lists/artist";
import { Styles as MainStyles } from "@/src/constants/Styles";
import QueryWrapper from "@/src/features/library/components/lists/query/Wrapper";
import { useLibraryListQueryState } from "@/src/features/library/hooks/use-library-list-query-state";
import { useLibraryArtistsQuery } from "@/src/features/library/hooks/use-library-artists-query";

const Artists = () => {
  const { order, query, setOrder, setQuery, setSort, sort } =
    useLibraryListQueryState({
      initialOrder: SortOrder.ASC,
      initialSort: SortType.ARTIST,
    });
  const { artists, isEmpty } = useLibraryArtistsQuery({ query, sort, order });

  return (
    <View style={Local.container}>
      <ArtistList
        artists={artists}
        pageType={PageType.LIBRARY}
        emptyComponent={<Text style={Local.emptyText}>No artists in library</Text>}
        showEmptyComponent={isEmpty}
        headerComponent={
          <QueryWrapper
            setQuery={setQuery}
            query={query}
            setSort={setSort}
            sort={sort}
            order={order}
            setOrder={setOrder}
            showSortTypes={{
              [SortType.ARTIST]: true,
              [SortType.DATE]: true,
            }}
          />
        }
      />
    </View>
  );
};

const Local = StyleSheet.create({
  container: {
    flex: 1,
    width: "100%",
  },
  emptyText: {
    ...MainStyles.h5,
    textAlign: "center",
    marginTop: 20,
    color: Colors.text,
  },
});

export default Artists;
