import { View } from "react-native";
import { Colors } from "@/constants/Colors";

const Bar = () => {
  return (
    <View style={{
      width: '100%',
      justifyContent: 'center',
      alignItems: 'center',
    }}>
      <View style={{
        backgroundColor: Colors.altDisabled,
        width: 80,
        height: 5,
        borderRadius: 100,
        marginTop: 15,
        marginBottom: 30,
      }}/>
    </View>
  );
}

export default Bar;