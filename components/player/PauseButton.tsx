import { View, StyleSheet } from "react-native";
import { Colors } from "@/constants/Colors";
const PauseButton = ({size}: {size: number}) => {

  const Local = StyleSheet.create({
    container: {
      justifyContent: 'center',
      alignItems: 'center',
      flexDirection: 'row',
      gap: 5
    },
    pause: {
      borderRadius: 10,
      height: size,
      width: 7,
      backgroundColor: Colors.text ,
    },
  });

  return (
    <View style={Local.container}>
      <View style={Local.pause}/>
      <View style={Local.pause}/> 
    </View>
  );

}

export default PauseButton;
