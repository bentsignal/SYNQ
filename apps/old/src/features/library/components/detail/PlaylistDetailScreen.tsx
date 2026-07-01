import { useMemo, useState } from "react";
import { PageType, SortOrder, SortType, SourceType } from "@/src/constants/Types";
import { useEntitySheetPresenter } from "@/src/features/action-sheet/hooks/use-entity-sheet-presenter";
import LibraryDetailScreen from "@/src/features/library/components/detail/LibraryDetailScreen";
import QueryWrapper from "@/src/features/library/components/lists/query/Wrapper";
import SongList from "@/src/features/library/components/lists/song";
import SongListHeader from "@/src/features/library/components/lists/song/Header";
import { useLibraryListQueryState } from "@/src/features/library/hooks/use-library-list-query-state";
import { useLibrarySongsQuery } from "@/src/features/library/hooks/use-library-songs-query";
import { usePlaylistInfoQuery } from "@/src/features/library/hooks/use-playlist-info-query";
import { View } from "react-native";

type PlaylistDetailScreenProps = {
  id: number;
};

const PlaylistDetailScreen = ({ id }: PlaylistDetailScreenProps) => {
  const { presentPlaylistSheet } = useEntitySheetPresenter();

  const [scrollPosition, setScrollPosition] = useState(0);
  const { order, query, setOrder, setQuery, setSort, sort } =
    useLibraryListQueryState({
      initialOrder: SortOrder.DESC,
      initialSort: SortType.DATE,
    });
  const { playlist } = usePlaylistInfoQuery(id);
  const { songs } = useLibrarySongsQuery({
    playlistId: id,
    pageType: PageType.LIBRARY,
    query,
    sort,
    order,
  });
  const title = playlist?.name ?? "";
  const songCount = playlist?.songCount ?? 0;
  const duration = useMemo(
    () => songs.reduce((acc, song) => acc + (song.duration ?? 0), 0),
    [songs],
  );

  return (
    <LibraryDetailScreen
      scrollPosition={scrollPosition}
      title={title}
      handleMore={() => presentPlaylistSheet(playlist)}
    >
      <SongList
        songs={songs}
        pageType={PageType.LIBRARY}
        sourceId={id}
        sourceType={SourceType.PLAYLIST}
        sort={sort}
        order={order}
        query={query}
        headerComponent={
          <>
            <SongListHeader
              id={id}
              title={title}
              songCount={songCount}
              pageType={PageType.PLAYLIST}
              duration={duration}
              image={playlist?.fullImage}
            />
            <QueryWrapper
              setQuery={setQuery}
              query={query}
              setSort={setSort}
              sort={sort}
              order={order}
              setOrder={setOrder}
              songList
              showSortTypes={{
                [SortType.TITLE]: true,
                [SortType.ARTIST]: true,
                [SortType.ALBUM]: true,
                [SortType.DATE]: true,
              }}
            />
          </>
        }
        footerComponent={<View style={{ height: 1000 }} />}
        setScrollPosition={setScrollPosition}
      />
    </LibraryDetailScreen>
  );
};

export default PlaylistDetailScreen;
