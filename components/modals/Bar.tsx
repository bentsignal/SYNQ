import { View, StyleSheet } from "react-native";
import { Colors } from "@/constants/Colors";

const Bar = ({color}: {color?: string;}) => {
  const Local = StyleSheet.create({
    container: {
      width: '100%',
      justifyContent: 'center',
      alignItems: 'center',
    },
    bar: {
      backgroundColor: color ? color : Colors.altDisabled,
      width: 80,
      height: 5,
      borderRadius: 100,
      marginTop: 15,
      marginBottom: 30,
    }
  });
  return (
    <View style={Local.container}>
      <View style={Local.bar}/>
    </View>
  );
}

export default Bar;