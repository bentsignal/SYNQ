import { View, Text, StyleSheet } from "react-native";
import PlaylistList from "@/components/lists/PlaylistList"; 
import { useEffect, useState } from "react";
import { Colors } from "@/constants/Colors";
import { Styles } from "@/constants/Styles";
import PlaylistDataManager from "@/lib/data/PlaylistDataManager";
import { PlaylistType } from "@/constants/Types";

const Playlists = () => {

  const [playlists, setPlaylists] = useState<PlaylistType[]>([]);

  useEffect(() => {
    const db = PlaylistDataManager.getInstance();
    db.getPlaylists().then((results) => {
      console.log(results);
      setPlaylists(results);
    });
  }, []);

  return (
    <View style={Local.container}>
      <Text style={Local.placeholderText}>Playlists</Text>
      <PlaylistList playlists={playlists} />
    </View>
  );
}

const Local = StyleSheet.create({
  container: {
    flex: 1,
    width: '90%',
  },
  placeholderText: {
    ...Styles.h3,
    color: Colors.text,
  }
});

export default Playlists;