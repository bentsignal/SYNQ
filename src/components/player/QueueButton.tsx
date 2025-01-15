import { TouchableOpacity, View, StyleSheet, Text } from "react-native";
import { Colors } from "@/src/constants/Colors";
import { router } from "expo-router";

const QueueButton = () => {

  const Local = StyleSheet.create({
    container: {
      width: 25,
      height: 25,
    },
    top: {
      borderColor: Colors.text,
      borderWidth: 3,
      borderStyle: 'solid',
      borderRadius: 10,
      height: 9,
    },
    line: {
      backgroundColor: Colors.text,
      height: 3,
      borderRadius: 10,
      marginTop: 4,
    }
  });

  return (
    <TouchableOpacity 
      style={Local.container}
      activeOpacity={0.5}
      onPress={() => {
        router.push('/queue');
      }}
    >
      <View style={Local.top}/>
      <View style={Local.line}/>
      <View style={Local.line}/>
    </TouchableOpacity>
  );
}

export default QueueButton;
