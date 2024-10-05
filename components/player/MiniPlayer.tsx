import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { Styles } from "@/constants/Styles";
import { useGlobalContext } from "@/context/GlobalProvider";
import { router } from "expo-router";

const MiniPlayer = () => {
  const { theme } = useGlobalContext();

  const Local = StyleSheet.create({
    container: {
      ...Styles.roundedContainer,
      position: 'absolute',
      bottom: 0,
      height: 60,
      width: '90%',
      backgroundColor: theme,
    }
  });

  return (
    <TouchableOpacity 
      style={Local.container}
      activeOpacity={0.8}
      onPress={() => {
        router.push('/player');
      }}
    >
      <Text>MiniPlayer</Text>
    </TouchableOpacity>
  )
}

export default MiniPlayer;