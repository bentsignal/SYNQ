import { Text, View } from "react-native";

export default function Library() {
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
          fontFamily: 'JakartaSans'
        }}
      >Library</Text>
    </View>
  );
}
