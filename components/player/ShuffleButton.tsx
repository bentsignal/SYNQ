import { View, TouchableOpacity, StyleSheet, Image } from "react-native";
import { useGlobalContext } from "@/context/GlobalProvider";
import { Colors } from "@/constants/Colors";
import { getNextUp } from "@/lib/SongManager";
import { useActiveTrack } from "react-native-track-player";
import { updateQueue } from "@/lib/PlayerManager";

const ShuffleButton = () => {

  const { 

    shuffle, theme,
    
    setShuffle,
  
  } = useGlobalContext();
  
  const track = useActiveTrack();

  const styles = StyleSheet.create({
    container: {
      paddingVertical: 5,
      // paddingRight: 10,
      // backgroundColor: 'green',
    },
    image: {
      width: 30,
      height: 30,
      tintColor: shuffle ? theme : Colors.text,
    },
  });

  const handlePress = async () => {
    const newValue = !shuffle;
    const id = track ? track.id : -1;
    await updateQueue(id, newValue, theme);
    setShuffle(newValue);
  }

  return (
    <TouchableOpacity
      style={styles.container}
      activeOpacity={0.7}
      onPress={handlePress}
    >
      <Image 
        source={require('@/assets/icons/shuffle.png')}
        style={styles.image}
      />
    </TouchableOpacity>
  )
}

export default ShuffleButton;