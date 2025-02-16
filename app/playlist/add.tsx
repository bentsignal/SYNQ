import { View, Text, StyleSheet } from "react-native"
import { useEffect, useState } from "react"
import { Colors } from "@/src/constants/Colors"
import { Styles } from "@/src/constants/Styles"
import Bar from "@/src/components/modals/Bar"
import CustomButton from "@/src/components/CustomButton"
import { router } from "expo-router"
import { PageType, PlaylistType, SortOrder, SortType } from "@/src/constants/Types"
import PlaylistList from "@/src/components/lists/playlist"
import { useSafeAreaInsets } from "react-native-safe-area-context"
import { useThemeContext } from "@/src/context/ThemeProvider"
import { getPlaylists, getPlaylistsContainingSong } from "@/src/controllers/PlaylistController"
import { PlaylistBusEvent } from "@/src/events/playlist/Events"
import playlistBus from "@/src/events/playlist/Bus"
import ModalStyles from "@/src/components/modals/Styles"
import { useGlobalContext } from "@/src/context/GlobalProvider"
import QueryWrapper from "@/src/components/lists/query/Wrapper"

const AddToPlaylist = () => {

  const { theme } = useThemeContext();
  const { editSong } = useGlobalContext();
  const insets = useSafeAreaInsets();
  const [playlists, setPlaylists] = useState<PlaylistType[]>([]);
  const [query, setQuery] = useState<string>('');
  const [sort, setSort] = useState<SortType>(SortType.DATE);
  const [order, setOrder] = useState<SortOrder>(SortOrder.DESC);


  const refreshPlaylists = async () => {
    try {
      let results = await getPlaylists(query, sort, order);
      results = results.filter((playlist) => playlist.id !== 1);
      // move liked songs to the front of the list
      const likedSongs = results.find(p => p.id === 2);
      if (likedSongs) {
        results.splice(results.indexOf(likedSongs), 2);
        results.unshift(likedSongs);
      }
      // move playlists with song to the front of the list
      if (editSong?.id) {
        const playlistsWithSong = await getPlaylistsContainingSong(editSong.id);
        for (let i = 0; i < results.length; i++) {
          if (playlistsWithSong.some(p => p.id === results[i].id)) {
            const [item] = results.splice(i, 1);
            results.unshift(item);
          }
        }
        setPlaylists(results);
      } else {
        setPlaylists(results);
      }
    }
    catch (error) {
      console.log('error refreshing playlists:', error);
    }
  }

  useEffect(() => {
    refreshPlaylists();
  }, [query, sort, order]);

  useEffect(() => {
    refreshPlaylists();
    playlistBus.on(PlaylistBusEvent.PLAYLIST_CREATED, refreshPlaylists);
    return () => {
      playlistBus.off(PlaylistBusEvent.PLAYLIST_CREATED, refreshPlaylists);
    }
  }, []);

  return (
    <View style={Local.wrapper}>
      <Bar />
      <Text style={ModalStyles.header}>Add to Playlist</Text>
      <CustomButton
        title={'New'}
        background={theme}
        handlePress={() => {
          router.push('/playlist/create');
        }}
        customStyles={{
          marginBottom: 20,
        }}  
      />
      <View style={Styles.divider} />
      <PlaylistList 
        playlists={playlists}
        pageType={PageType.ADD}
        gradientStart={'rgba(24, 24, 24, 1)'}
        gradientEnd={'rgba(24, 24, 24, 0)'}
        headerComponent={
          <QueryWrapper 
            query={query} 
            setQuery={setQuery} 
            sort={sort} 
            setSort={setSort} 
            order={order} 
            setOrder={setOrder}
            showSortTypes={{
              [SortType.TITLE]: true,
              [SortType.DATE]: true,
            }}
          />
        }
      />
      <View style={[Local.bottomButtonsWrapper, {paddingBottom: insets.bottom}]}>
        <CustomButton
          title={'Close'}
          handlePress={() => {
            router.back();
          }}
        />
      </View>
    </View>
  );
}

const Local = StyleSheet.create({
  wrapper: {
    ...Styles.body,
    backgroundColor: Colors.popup,
    ...ModalStyles.roundedTop,
  },
  bottomButtonsWrapper: {
    flexDirection: 'row',
    justifyContent: 'center', 
    gap: 10,
    width: '100%',
  }
})

export default AddToPlaylist;