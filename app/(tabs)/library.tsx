import { Text, View } from "react-native";

import { Colors } from "@/constants/Colors";

const Library = () => {
  return (
    <View
      style={{
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <Text 
        style={{
          fontFamily: 'JakartaSans',
          color: Colors.text
        }}
      >Library</Text>
    </View>
  );
}

export default Library;