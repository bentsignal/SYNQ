import { useLocalSearchParams } from "expo-router";
import { PageType, SortOrder, SortType, SourceType } from "@/src/constants/Types";
import { useActionSheetContext } from "@/src/features/action-sheet/context/ActionSheetProvider";
import AddToLibraryEntityScreen from "@/src/features/library/components/add/AddToLibraryEntityScreen";
import ArtistList from "@/src/features/library/components/lists/artist";
import { useLibraryArtistsQuery } from "@/src/features/library/hooks/use-library-artists-query";
import { useLibraryListQueryState } from "@/src/features/library/hooks/use-library-list-query-state";

const AddToArtistScreen = () => {
  const { sourceType } = useLocalSearchParams();
  const { editSong } = useActionSheetContext();
  const { order, query, setOrder, setQuery, setSort, sort } =
    useLibraryListQueryState({
      initialOrder: SortOrder.ASC,
      initialSort: SortType.ARTIST,
    });
  const artistSourceType =
    sourceType === "song" ? SourceType.SONG : SourceType.ALBUM;
  const { artists } = useLibraryArtistsQuery({
    prioritizeSongId: editSong?.id,
    query,
    sort,
    order,
    sourceType: artistSourceType,
  });

  return (
    <AddToLibraryEntityScreen
      createRoute="/artist/create"
      order={order}
      query={query}
      renderList={(headerComponent) => (
        <ArtistList
          artists={artists}
          pageType={PageType.ADD}
          gradientStart={"rgba(24, 24, 24, 1)"}
          gradientEnd={"rgba(24, 24, 24, 0)"}
          headerComponent={headerComponent}
        />
      )}
      setOrder={setOrder}
      setQuery={setQuery}
      setSort={setSort}
      showSortTypes={{
        [SortType.ARTIST]: true,
        [SortType.DATE]: true,
      }}
      sort={sort}
      title="Add Artists"
    />
  );
};

export default AddToArtistScreen;
