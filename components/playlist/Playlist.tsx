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
      <View style={Local.textWrapper}>
        <Text style={Local.name}>{playlist.name}</Text>
        <Text style={Local.count}>{playlist.songCount} {playlist.songCount === 1 ? 'song' : 'songs'}</Text>
      </View>
    </TouchableOpacity>
  )
}

const Local = StyleSheet.create({
  container: {
    ...Styles.roundedContainer,
    ...Styles.listItem,
    backgroundColor: Colors.song,
  },
  textWrapper: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'flex-start',
  },
  name: {
    ...Styles.h4,
    color: Colors.text,
  },
  count: {
    ...Styles.p,
    color: Colors.infoText,

  },
}); 

export default Playlist;