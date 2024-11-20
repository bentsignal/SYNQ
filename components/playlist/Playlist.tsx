import { View, Text, StyleSheet } from "react-native"
import { PlaylistType } from "@/constants/Types";
import { Styles } from "@/constants/Styles";
import { Colors } from "@/constants/Colors";

const Playlist = ({playlist}: {playlist: PlaylistType}) => {
  return (
    <View>
      <Text style={Local.text}>{playlist.name}</Text>
    </View>
  )
}

const Local = StyleSheet.create({
  text: {
    ...Styles.h3,
    color: Colors.text,
  }
}); 

export default Playlist;