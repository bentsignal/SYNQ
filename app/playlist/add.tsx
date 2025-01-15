import { View, Text, StyleSheet } from "react-native"
import { useEffect, useState } from "react"
import { Colors } from "@/src/constants/Colors"
import { Styles } from "@/src/constants/Styles"
import Bar from "@/src/components/modals/Bar"
import CustomButton from "@/src/components/CustomButton"
import { router } from "expo-router"
import { PageType, PlaylistType } from "@/src/constants/Types"
import PlaylistList from "@/src/components/lists/playlist"
import { useSafeAreaInsets } from "react-native-safe-area-context"
import { useThemeContext } from "@/src/context/ThemeProvider"
import { getPlaylists } from "@/lib/controllers/PlaylistController"
import { PlaylistBusEvent } from "@/src/events/playlist/Events"
import playlistBus from "@/src/events/playlist/Bus"
import ModalStyles from "@/src/components/modals/Styles"

const AddToPlaylist = () => {

  const { theme } = useThemeContext();

  const insets = useSafeAreaInsets();

  const [playlists, setPlaylists] = useState<PlaylistType[]>([]);

  const refreshPlaylists = async () => {
    try {
      const results = await getPlaylists();
      setPlaylists(results.filter((playlist) => playlist.id !== 1));
    }
    catch (error) {
      console.log('error refreshing playlists:', error);
    }
  }

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
      <Text style={ModalStyles.header}>Manage Playlists</Text>
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