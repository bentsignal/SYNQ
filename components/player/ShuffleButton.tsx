import { View, TouchableOpacity, StyleSheet, Image } from "react-native";
import { useGlobalContext } from "@/context/GlobalProvider";
import { Colors } from "@/constants/Colors";
import { getNextUp } from "@/lib/SongManager";

const ShuffleButton = () => {

  const { 

    shuffle, theme, songPlaying,
    
    setShuffle, setNextUp,
  
  } = useGlobalContext();

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
    setShuffle(newValue);
    const id = songPlaying ? songPlaying.id : -1;
    setNextUp(await getNextUp(id, 30, newValue));
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