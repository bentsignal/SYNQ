import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { useGlobalContext } from "@/context/GlobalProvider";
import CustomButton from "@/components/CustomButton";

const Player = () => {

  const { theme } = useGlobalContext();

  const Local = StyleSheet.create({
    container: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
    }
  });

  return (
    <View style={Local.container}>
      <Text>Player</Text>
    </View>
  );

}

export default Player;