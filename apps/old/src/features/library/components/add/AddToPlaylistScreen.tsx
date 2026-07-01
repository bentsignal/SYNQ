import { PageType, SortType } from "@/src/constants/Types";
import { useActionSheetContext } from "@/src/features/action-sheet/context/ActionSheetProvider";
import AddToLibraryEntityScreen from "@/src/features/library/components/add/AddToLibraryEntityScreen";
import PlaylistList from "@/src/features/library/components/lists/playlist";
import { useLibraryListQueryState } from "@/src/features/library/hooks/use-library-list-query-state";
import { useLibraryPlaylistsQuery } from "@/src/features/library/hooks/use-library-playlists-query";

const AddToPlaylistScreen = () => {
  const { editSong } = useActionSheetContext();
  const { order, query, setOrder, setQuery, setSort, sort } =
    useLibraryListQueryState({
      initialSort: SortType.DATE,
    });
  const { playlists } = useLibraryPlaylistsQuery({
    prioritizeSongId: editSong?.id,
    query,
    sort,
    order,
  });

  return (
    <AddToLibraryEntityScreen
      createRoute="/playlist/create"
      order={order}
      query={query}
      renderList={(headerComponent) => (
        <PlaylistList
          playlists={playlists}
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
        [SortType.TITLE]: true,
        [SortType.DATE]: true,
      }}
      sort={sort}
      title="Add to Playlist"
    />
  );
};

export default AddToPlaylistScreen;
