import { useEffect, useState } from "react";
import Header from "@/src/features/library/components/Header";
import AlbumList from "@/src/features/library/components/lists/album";
import ArtistHeader from "@/src/features/library/components/lists/artist/Header";
import QueryWrapper from "@/src/features/library/components/lists/query/Wrapper";
import SongList from "@/src/features/library/components/lists/song";
import Overlay from "@/src/features/app-shell/components/Overlay";
import TabSelector from "@/src/features/library/components/TabSelector";
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
import { useArtistAlbumsQuery } from "@/src/features/library/hooks/use-artist-albums-query";
import { useArtistInfoQuery } from "@/src/features/library/hooks/use-artist-info-query";
import { useArtistSongsQuery } from "@/src/features/library/hooks/use-artist-songs-query";
import { useLibraryListQueryState } from "@/src/features/library/hooks/use-library-list-query-state";
import { useHaptics } from "@/src/features/haptics/hooks/use-haptics";
import { TrueSheet } from "@lodev09/react-native-true-sheet";
import { StyleSheet, Text, View } from "react-native";

const ArtistView = ({ id }: { id: number }) => {
  const { setEditArtist } = useActionSheetContext();
  const { showOverlay } = useAppShellContext();
  const { sendHaptic } = useHaptics();

  const [scrollPosition, setScrollPosition] = useState(0);
  const [tabIndex, setTabIndex] = useState(0);
  const {
    order: songOrder,
    query: songsQuery,
    setOrder: setSongOrder,
    setQuery: setSongsQuery,
    setSort: setSongSort,
    sort: songSort,
  } = useLibraryListQueryState({
    initialOrder: SortOrder.DESC,
    initialSort: SortType.ALBUM,
  });
  const {
    order: albumOrder,
    query: albumsQuery,
    setOrder: setAlbumOrder,
    setQuery: setAlbumsQuery,
    setSort: setAlbumSort,
    sort: albumSort,
  } = useLibraryListQueryState({
    initialOrder: SortOrder.DESC,
    initialSort: SortType.YEAR,
  });
  const { artist } = useArtistInfoQuery(id);
  const { songs, totalSongCount, isEmpty: songsEmpty } = useArtistSongsQuery({
    artistId: id,
    query: songsQuery,
    sort: songSort,
    order: songOrder,
  });
  const { albums, isEmpty: albumsEmpty } = useArtistAlbumsQuery({
    artistId: id,
    query: albumsQuery,
    sort: albumSort,
    order: albumOrder,
  });
  const title = artist?.name ?? "";

  useEffect(() => {
    if (tabIndex === 0) {
      setAlbumsQuery("");
    } else {
      setSongsQuery("");
    }
  }, [setAlbumsQuery, setSongsQuery, tabIndex]);

  const handleMore = () => {
    if (!artist) {
      return;
    }

    sendHaptic("light");
    setEditArtist(artist);
    try {
      TrueSheet.present("artist-sheet");
    } catch (error) {
      console.log("error snapping to artist sheet:", error);
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
        {tabIndex === 0 && (
          <SongList
            songs={songs}
            pageType={PageType.ARTIST}
            sourceId={id}
            sourceType={SourceType.ARTIST}
            sort={songSort}
            order={songOrder}
            query={songsQuery}
            showEmptyComponent={songsEmpty}
            emptyComponent={
              <Text style={Local.emptyText}>No songs in library</Text>
            }
            headerComponent={
              <>
                <ArtistHeader
                  id={id}
                  title={title}
                  pageType={PageType.ARTIST}
                  songCount={totalSongCount}
                  image={artist?.fullImage}
                />
                <TabSelector
                  tabs={["Songs", "Albums"]}
                  index={tabIndex}
                  onSelect={setTabIndex}
                />
                <QueryWrapper
                  setQuery={setSongsQuery}
                  query={songsQuery}
                  songList
                  setSort={setSongSort}
                  sort={songSort}
                  order={songOrder}
                  setOrder={setSongOrder}
                  showSortTypes={{
                    [SortType.TITLE]: true,
                    [SortType.ALBUM]: true,
                  }}
                />
              </>
            }
            footerComponent={<View style={{ height: 1000 }} />}
            setScrollPosition={setScrollPosition}
          />
        )}
        {tabIndex === 1 && (
          <AlbumList
            albums={albums}
            pageType={PageType.LIBRARY}
            headerComponent={
              <>
                <ArtistHeader
                  id={id}
                  title={title}
                  pageType={PageType.ARTIST}
                  songCount={totalSongCount}
                  image={artist?.fullImage}
                />
                <TabSelector
                  tabs={["Songs", "Albums"]}
                  index={tabIndex}
                  onSelect={setTabIndex}
                />
                <QueryWrapper
                  setQuery={setAlbumsQuery}
                  query={albumsQuery}
                  setSort={setAlbumSort}
                  sort={albumSort}
                  order={albumOrder}
                  setOrder={setAlbumOrder}
                  showSortTypes={{
                    [SortType.ALBUM]: true,
                    [SortType.YEAR]: true,
                  }}
                />
              </>
            }
            footerComponent={<View style={{ height: 1000 }} />}
            emptyComponent={
              <Text style={Local.emptyText}>No albums in library</Text>
            }
            showEmptyComponent={albumsEmpty}
          />
        )}
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
  emptyText: {
    ...Styles.h5,
    textAlign: "center",
    marginTop: 20,
    color: Colors.text,
  },
});

export default ArtistView;
