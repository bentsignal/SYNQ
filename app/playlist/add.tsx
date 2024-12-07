import { View, Text, StyleSheet } from "react-native"
import { useEffect, useState } from "react"
import { Colors } from "@/constants/Colors"
import { Styles } from "@/constants/Styles"
import Bar from "@/components/modals/Bar"
import CustomButton from "@/components/CustomButton"
import { router } from "expo-router"
import { useGlobalContext } from "@/context/GlobalProvider"
import { PageType, PlaylistType } from "@/constants/Types"
import PlaylistList from "@/components/lists/playlist"
import { useSafeAreaInsets } from "react-native-safe-area-context"
import playlistBus from "@/station/playlistBus"
import { useThemeContext } from "@/context/ThemeProvider"
import { getPlaylists } from "@/lib/PlaylistManager"

const AddToPlaylist = () => {

  const { numModified } = useGlobalContext();
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
    playlistBus.on('playlistChangesMade', refreshPlaylists);
    return () => {
      playlistBus.off('playlistChangesMade', refreshPlaylists);
    }
  }, []);

  useEffect(() => {
    refreshPlaylists();
  }, [numModified]);

  return (
    <View style={Local.wrapper}>
      <Bar />
      <Text style={Local.header}>Add to Playlist</Text>
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
        pageType={PageType.CREATE}
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
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    backgroundColor: Colors.background,
  },
  header: {
    ...Styles.h2,
    color: Colors.text,
    marginBottom: 10,
  },
  bottomButtonsWrapper: {
    flexDirection: 'row',
    justifyContent: 'center', 
    gap: 10,
    width: '100%',
  }
})

export default AddToPlaylist;