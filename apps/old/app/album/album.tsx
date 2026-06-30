import { useEffect, useState } from "react";
import Header from "@/src/features/library/components/Header";
import AlbumHeader from "@/src/features/library/components/lists/album/Header";
import ArtistItem from "@/src/features/library/components/lists/artist/ArtistItem";
import QueryWrapper from "@/src/features/library/components/lists/query/Wrapper";
import SongList from "@/src/features/library/components/lists/song";
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
import { useAlbumInfoQuery } from "@/src/features/library/hooks/use-album-info-query";
import { useAlbumSongsQuery } from "@/src/features/library/hooks/use-album-songs-query";
import { useHaptics } from "@/src/features/haptics/hooks/use-haptics";
import { TrueSheet } from "@lodev09/react-native-true-sheet";
import { StyleSheet, Text, View } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";

const AlbumView = ({ id }: { id: number }) => {
  const { setEditAlbum } = useActionSheetContext();
  const { showOverlay } = useAppShellContext();

  const { sendHaptic } = useHaptics();

  const [scrollPosition, setScrollPosition] = useState(0);
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState<SortType>(SortType.TRACK);
  const [order, setOrder] = useState<SortOrder>(SortOrder.ASC);
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

  const handleMore = () => {
    if (!album) {
      return;
    }

    sendHaptic("light");
    setEditAlbum(album);
    try {
      TrueSheet.present("album-sheet");
    } catch (error) {
      console.log("error snapping to album sheet:", error);
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

export default AlbumView;
