import { useMemo, useState } from "react";
import Header from "@/src/features/library/components/Header";
import QueryWrapper from "@/src/features/library/components/lists/query/Wrapper";
import SongList from "@/src/features/library/components/lists/song";
import SongListHeader from "@/src/features/library/components/lists/song/Header";
import Overlay from "@/src/features/app-shell/components/Overlay";
import { Colors } from "@/src/constants/Colors";
import { Styles } from "@/src/constants/Styles";
import {
  PageType,
  SortOrder,
  SortType,
  SourceType,
} from "@/src/constants/Types";
import { useActionSheetContext } from "@/src/features/action-sheet/context/ActionSheetProvider";
import { useAppShellContext } from "@/src/features/app-shell/context/AppShellProvider";
import { useLibrarySongsQuery } from "@/src/features/library/hooks/use-library-songs-query";
import { usePlaylistInfoQuery } from "@/src/features/library/hooks/use-playlist-info-query";
import { useHaptics } from "@/src/features/haptics/hooks/use-haptics";
import { TrueSheet } from "@lodev09/react-native-true-sheet";
import { StyleSheet, View } from "react-native";

const PlaylistView = ({ id }: { id: number }) => {
  const { setEditPlaylist } = useActionSheetContext();
  const { showOverlay } = useAppShellContext();
  const { sendHaptic } = useHaptics();

  const [scrollPosition, setScrollPosition] = useState(0);
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState<SortType>(SortType.DATE);
  const [order, setOrder] = useState<SortOrder>(SortOrder.DESC);
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

  const handleMore = () => {
    if (!playlist) {
      return;
    }

    sendHaptic("light");
    setEditPlaylist({ ...playlist, pageType: PageType.PLAYLIST });
    try {
      TrueSheet.present("playlist-sheet");
    } catch (error) {
      console.log("error snapping to playlist sheet:", error);
    }
  };

  return (
    <View style={Local.wrapper}>
      <View style={Local.container}>
        <Header
          scrollPosition={scrollPosition}
          title={title}
          showMore={true}
          handleMore={handleMore}
        />
        <Overlay show={showOverlay} activeOpacity={0.95} />
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
      </View>
    </View>
  );
};

const Local = StyleSheet.create({
  wrapper: {
    flex: 1,
    backgroundColor: "black",
  },
  container: {
    ...Styles.body,
    flex: 1,
    backgroundColor: Colors.background,
  },
});

export default PlaylistView;
