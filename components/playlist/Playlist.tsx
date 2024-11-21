import { View, Text, StyleSheet, TouchableOpacity } from "react-native"
import { PlaylistType } from "@/constants/Types";
import { Styles } from "@/constants/Styles";
import { Colors } from "@/constants/Colors";
import { router } from "expo-router";
const Playlist = ({playlist}: {playlist: PlaylistType}) => {

  return (
    <TouchableOpacity 
      style={Local.container}
      onPress={() => {
        router.push(`/playlist/${playlist.id}`);
      }}
    >
      <Text style={Local.text}>{playlist.name}</Text>
      <Text style={Local.text}>{playlist.name}</Text>
    </TouchableOpacity>
  )
}

const Local = StyleSheet.create({
  container: {
    ...Styles.roundedContainer,
    ...Styles.listItem,
    backgroundColor: Colors.song,
  },
  text: {
    ...Styles.h3,
    color: Colors.text,
    flex: 1,
  }
}); 

export default Playlist;