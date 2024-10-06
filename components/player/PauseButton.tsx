import { View, StyleSheet } from "react-native";
import { Colors } from "@/constants/Colors";
const PauseButton = ({width, height}: {width: number, height: number}) => {

  const Local = StyleSheet.create({
    container: {
      justifyContent: 'center',
      alignItems: 'center',
      flexDirection: 'row',
      gap: 5,
    },
    pause: {
      borderRadius: 10,
      height: height,
      width: width,
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
