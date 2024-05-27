import { Text, View } from "react-native";

import { Colors } from '@/constants/Colors'

const Home = () => {
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

export default Home;