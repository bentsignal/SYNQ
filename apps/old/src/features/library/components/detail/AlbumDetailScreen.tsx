import { useEffect, useState } from "react";
import { Colors } from "@/src/constants/Colors";
import { Styles } from "@/src/constants/Styles";
import {
  PageType,
  SortOrder,
  SortType,
  SourceType,
} from "@/src/constants/Types";
import { useEntitySheetPresenter } from "@/src/features/action-sheet/hooks/use-entity-sheet-presenter";
import LibraryDetailScreen from "@/src/features/library/components/detail/LibraryDetailScreen";
import AlbumHeader from "@/src/features/library/components/lists/album/Header";
import ArtistItem from "@/src/features/library/components/lists/artist/ArtistItem";
import QueryWrapper from "@/src/features/library/components/lists/query/Wrapper";
import SongList from "@/src/features/library/components/lists/song";
import { useAlbumInfoQuery } from "@/src/features/library/hooks/use-album-info-query";
import { useAlbumSongsQuery } from "@/src/features/library/hooks/use-album-songs-query";
import { useLibraryListQueryState } from "@/src/features/library/hooks/use-library-list-query-state";
import { StyleSheet, Text } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";

type AlbumDetailScreenProps = {
  id: number;
};

const AlbumDetailScreen = ({ id }: AlbumDetailScreenProps) => {
  const { presentAlbumSheet } = useEntitySheetPresenter();

  const [scrollPosition, setScrollPosition] = useState(0);
  const { order, query, setOrder, setQuery, setSort, sort } =
    useLibraryListQueryState({
      initialOrder: SortOrder.ASC,
      initialSort: SortType.TRACK,
    });
  const { album, artists } = useAlbumInfoQuery(id);
  const { songs, totalSongCount, totalDuration } = useAlbumSongsQuery({
    albumId: id,
    query,
    sort,
    order,
  });
  const title = album?.name ?? "";
  const year = album?.year;

  const artistListOpacity = useSharedValue(0);

  const artistListAnimatedStyle = useAnimatedStyle(() => ({
    opacity: artistListOpacity.value,
  }));

  useEffect(() => {
    if (songs.length > 0 || artists.length > 0) {
      artistListOpacity.value = withTiming(1, { duration: 500 });
    }
  }, [artistListOpacity, artists.length, songs.length]);

  return (
    <LibraryDetailScreen
      scrollPosition={scrollPosition}
      title={title}
      handleMore={() => presentAlbumSheet(album)}
    >
      <SongList
        songs={songs}
        pageType={PageType.ALBUM}
        sourceId={id}
        sourceType={SourceType.ALBUM}
        sort={sort}
        order={order}
        query={query}
        headerComponent={
          <>
            <AlbumHeader
              id={id}
              title={title}
              year={year}
              leadArtist={artists[0]}
              songCount={totalSongCount}
              pageType={PageType.ALBUM}
              duration={totalDuration}
              image={album?.fullImage}
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
                [SortType.TRACK]: true,
              }}
            />
          </>
        }
        setScrollPosition={setScrollPosition}
        footerComponent={
          <Animated.View style={[Local.artistList, artistListAnimatedStyle]}>
            {artists.length > 0 && (
              <Text style={Local.artistListTitle}>Artists</Text>
            )}
            {artists.map((artist) => (
              <ArtistItem
                key={artist.id}
                artist={artist}
                allowInteraction={true}
              />
            ))}
          </Animated.View>
        }
      />
    </LibraryDetailScreen>
  );
};

const Local = StyleSheet.create({
  artistList: {
    width: "100%",
    height: 1000,
  },
  artistListTitle: {
    ...Styles.h4,
    color: Colors.text,
    marginTop: 20,
    marginBottom: 10,
  },
});

export default AlbumDetailScreen;
