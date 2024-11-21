import { View, Text, StyleSheet } from "react-native";
import PlaylistList from "@/components/lists/PlaylistList"; 
import { useEffect, useState } from "react";
import { Colors } from "@/constants/Colors";
import { Styles } from "@/constants/Styles";
import PlaylistDataManager from "@/lib/data/PlaylistDataManager";
import { PlaylistType } from "@/constants/Types";
import { useGlobalContext } from "@/context/GlobalProvider";

const Playlists = () => {

  const { numModified, homeState } = useGlobalContext();

  const [playlists, setPlaylists] = useState<PlaylistType[]>([]);

  useEffect(() => {
    const db = PlaylistDataManager.getInstance();
    db.getPlaylists().then((results) => {
      console.log(results);
      setPlaylists(results);
    });
  }, [numModified, homeState]);

  return (
    <View style={Local.container}>
      <PlaylistList playlists={playlists} />
    </View>
  );
}

const Local = StyleSheet.create({
  container: {
    flex: 1,
    width: '100%',
  },
});

export default Playlists;