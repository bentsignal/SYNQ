import { View, Text, StyleSheet } from "react-native"
import { useEffect, useState } from "react"
import { Colors } from "@/constants/Colors"
import { Styles } from "@/constants/Styles"
import Bar from "@/components/modals/Bar"
import CustomButton from "@/components/CustomButton"
import { router } from "expo-router"
import { useGlobalContext } from "@/context/GlobalProvider"
import { PlaylistType } from "@/constants/Types"
import PlaylistDataManager from "@/lib/data/PlaylistDataManager"
import PlaylistList from "@/components/lists/PlaylistList"

const AddToPlaylist = () => {


  const {

    theme, numModified

  } = useGlobalContext();

  const [playlists, setPlaylists] = useState<PlaylistType[]>([]);

  useEffect(() => {
    const db = PlaylistDataManager.getInstance();
    db.getPlaylists().then((results) => {
      setPlaylists(results);
    });
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
      <PlaylistList playlists={playlists} />
    </View>
  );
}

const Local = StyleSheet.create({
  wrapper: {
    ...Styles.body,
    backgroundColor: Colors.background,
  },
  header: {
    ...Styles.h2,
    color: Colors.text,
    marginBottom: 10,
  }
})

export default AddToPlaylist;