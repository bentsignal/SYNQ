import { View, TouchableOpacity, StyleSheet, Image } from "react-native";
import { useGlobalContext } from "@/context/GlobalProvider";
import { Colors } from "@/constants/Colors";
const ShuffleButton = () => {

  const { 

    shuffle, theme,
    
    setShuffle 
  
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

  return (
    <TouchableOpacity
      style={styles.container}
      activeOpacity={0.7}
      onPress={() => setShuffle(!shuffle)}
    >
      <Image 
        source={require('@/assets/icons/shuffle.png')}
        style={styles.image}
      />
    </TouchableOpacity>
  )
}

export default ShuffleButton;