import { PageType, SortType } from "@/src/constants/Types";
import AlbumList from "@/src/features/library/components/lists/album";
import { useActionSheetContext } from "@/src/features/action-sheet/context/ActionSheetProvider";
import AddToLibraryEntityScreen from "@/src/features/library/components/add/AddToLibraryEntityScreen";
import { useLibraryAlbumsQuery } from "@/src/features/library/hooks/use-library-albums-query";
import { useLibraryListQueryState } from "@/src/features/library/hooks/use-library-list-query-state";

const AddAlbum = () => {
  const { editSong } = useActionSheetContext();
  const { order, query, setOrder, setQuery, setSort, sort } =
    useLibraryListQueryState({
      initialSort: SortType.DATE,
    });
  const { albums } = useLibraryAlbumsQuery({
    prioritizeSongId: editSong?.id,
    query,
    sort,
    order,
  });

  return (
    <AddToLibraryEntityScreen
      createRoute="/album/create"
      order={order}
      query={query}
      renderList={(headerComponent) => (
        <AlbumList
          albums={albums}
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
        [SortType.ALBUM]: true,
        [SortType.DATE]: true,
        [SortType.YEAR]: true,
      }}
      sort={sort}
      title="Add to Album"
    />
  );
};

export default AddAlbum;
