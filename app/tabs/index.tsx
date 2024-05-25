import { Text, View } from "react-native";

import { Colors } from '@/constants/Colors'

export default function Index() {
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
      >Home</Text>
    </View>
  );
}
