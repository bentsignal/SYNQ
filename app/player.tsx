import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { useGlobalContext } from "@/context/GlobalProvider";
import CustomButton from "@/components/CustomButton";
import { router } from "expo-router";

const Player = () => {

  const { theme, songPlaying } = useGlobalContext();

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
      <CustomButton 
        title='Back'
        handlePress={() => router.back()}
        background={theme}
      />
    </View>
  );

}

export default Player;