import { Colors } from "@/src/constants/Colors";
import { View, TouchableOpacity, StyleSheet } from "react-native";

const CloseButton = ({action}: {action: () => void}) => {

  const Local = StyleSheet.create({
    container: {
      paddingVertical: 20,
      // paddingLeft: 20,
      width: 20,
      justifyContent: 'center',
      // alignItems: 'flex-end',
      // transform: [{rotate: '45deg'}],
      // backgroundColor: 'blue',
    },
    wrapper: {
      // backgroundColor: 'orange',
      width: 20,
      height: 20,
      justifyContent: 'center',
      alignItems: 'center',
      transform: [{rotate: '45deg'}],
    },
    line: {
      position: 'absolute',
      width: 20,
      height: 4,
      borderRadius: 5,
      backgroundColor: Colors.text,
    }
  });

  return (
    <TouchableOpacity
      activeOpacity={0.7}
      onPress={action}
      style={Local.container}
    >
      <View style={Local.wrapper}>
        <View style={[Local.line, {transform: [{rotate: '90deg'}]}]}/>
        <View style={Local.line}/>
      </View>
    </TouchableOpacity>
  )
}

export default CloseButton;
